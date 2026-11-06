import base64
import io
import os
from unittest import mock

import numpy as np
import pytest
from PIL import Image

os.environ['DISABLE_HF_MODEL'] = '1'

from backend import plant_diagnosis_api as api  # noqa: E402


def image_bytes(fmt='JPEG', size=(64, 64)):
    buffer = io.BytesIO()
    Image.new('RGB', size, 'green').save(buffer, format=fmt)
    return buffer.getvalue()


def noise_png(side):
    pixels = np.random.default_rng(0).integers(0, 255, (side, side, 3), dtype='uint8')
    buffer = io.BytesIO()
    Image.fromarray(pixels).save(buffer, format='PNG')
    return buffer.getvalue()


def post_base64(client, data):
    return client.post('/api/diagnose', json={'image_data': base64.b64encode(data).decode()})


@pytest.fixture
def client():
    api.limiter.enabled = False
    predictions = ([{'label': 'Tomato with Late Blight', 'score': 0.99}], 'test')
    with mock.patch.object(api, 'predict_plant_disease', return_value=predictions):
        with mock.patch.object(api, 'save_plant_image_to_s3', return_value=None) as save:
            test_client = api.app.test_client()
            test_client.save = save
            yield test_client
    api.limiter.enabled = True


@pytest.mark.parametrize('fmt', ['JPEG', 'PNG', 'WEBP'])
def test_allowed_formats_are_accepted(client, fmt):
    response = post_base64(client, image_bytes(fmt))
    assert response.status_code == 200
    assert response.get_json()['result']['disease'] == 'Tomato with Late Blight'
    client.save.assert_called_once()


@pytest.mark.parametrize('data', [
    b'this is not an image',
    b'<svg xmlns="http://www.w3.org/2000/svg"></svg>',
    image_bytes('GIF'),
    image_bytes('BMP'),
    image_bytes('JPEG')[:200],
], ids=['text', 'svg', 'gif', 'bmp', 'truncated-jpeg'])
def test_other_content_is_rejected_and_not_stored(client, data):
    response = post_base64(client, data)
    assert response.status_code == 400
    assert response.get_json()['success'] is False
    client.save.assert_not_called()


def test_declared_type_does_not_bypass_the_content_check(client):
    data = {'file': (io.BytesIO(b'<script>alert(1)</script>'), 'leaf.jpg', 'image/jpeg')}
    response = client.post('/api/diagnose', data=data, content_type='multipart/form-data')
    assert response.status_code == 400


def test_file_just_over_5_mb_is_rejected(client):
    large = noise_png(1330)
    assert api.MAX_IMAGE_BYTES < len(large) < api.app.config['MAX_CONTENT_LENGTH']
    data = {'file': (io.BytesIO(large), 'leaf.png')}
    response = client.post('/api/diagnose', data=data, content_type='multipart/form-data')
    assert response.status_code == 400
    assert '5 MB' in response.get_json()['error']
    client.save.assert_not_called()


def test_request_far_over_the_limit_is_rejected(client):
    response = post_base64(client, noise_png(1700))
    assert response.status_code == 413
    assert '5 MB' in response.get_json()['error']


def test_image_with_too_many_pixels_is_rejected(client):
    with mock.patch.object(api, 'MAX_IMAGE_PIXELS', 1000):
        response = post_base64(client, image_bytes())
    assert response.status_code == 400
    client.save.assert_not_called()


def test_image_url_is_no_longer_fetched(client):
    with mock.patch.object(api.requests, 'get') as fetch:
        response = client.post('/api/diagnose', json={'image_url': 'http://169.254.169.254/latest/meta-data/'})
    assert response.status_code == 400
    fetch.assert_not_called()


@pytest.mark.parametrize('path, body', [
    ('/api/chat', {'message': 'hello'}),
    ('/api/voice-chat', {'message': 'hello'}),
    ('/api/treatment/steps', {'disease': 'Tomato with Late Blight'}),
    ('/api/treatment/fertilizers', {'disease': 'Tomato with Late Blight'}),
])
def test_gemini_endpoints_are_rate_limited(client, path, body):
    api.limiter.enabled = True
    api.limiter.reset()
    with mock.patch.object(api, 'gemini_model', None):
        codes = [client.post(path, json=body, environ_base={'REMOTE_ADDR': '203.0.113.3'}).status_code for _ in range(21)]
    assert codes[:20] == [200] * 20
    assert codes[20] == 429


@pytest.mark.parametrize('gemini, expected', [
    ({'is_plant': False, 'disease': 'Healthy Plant', 'is_healthy': True}, 'Could Not Identify'),
    ({'is_plant': True, 'disease': 'Rice Blast', 'is_healthy': False}, 'Rice Blast'),
], ids=['not-a-plant', 'plant'])
def test_gemini_only_overrides_for_real_plants(client, gemini, expected):
    unsure = ([{'label': 'Healthy Apple', 'score': 0.3}], 'test')
    with mock.patch.object(api, 'predict_plant_disease', return_value=unsure):
        with mock.patch.object(api, 'diagnose_with_gemini', return_value=gemini):
            response = post_base64(client, image_bytes())
    assert response.get_json()['result']['disease'] == expected


def test_gemini_calls_have_a_hard_timeout(client):
    with mock.patch.object(api, 'gemini_model') as model:
        model.generate_content.return_value.text = 'reply'
        assert client.post('/api/chat', json={'message': 'hello'}).status_code == 200
    assert model.generate_content.call_args.kwargs['request_options'] == api.GEMINI_REQUEST_OPTIONS


def test_rate_limit_applies_per_ip(client):
    api.limiter.enabled = True
    api.limiter.reset()
    first_ip = {'REMOTE_ADDR': '203.0.113.1'}
    other_ip = {'REMOTE_ADDR': '203.0.113.2'}
    body = {'image_data': base64.b64encode(image_bytes()).decode()}

    codes = [client.post('/api/diagnose', json=body, environ_base=first_ip).status_code for _ in range(21)]
    assert codes[:20] == [200] * 20
    assert codes[20] == 429

    assert client.post('/api/diagnose', json=body, environ_base=other_ip).status_code == 200
