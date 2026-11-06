"""Local Keras MobileNetV2 plant disease classifier (38 PlantVillage classes)."""

import h5py
import numpy as np
from PIL import Image

INPUT_SIZE = (224, 224)

# Model output index -> class name. The .h5 file does not store its labels, so
# this assumes training on the PlantVillage folders in sorted order. Confirm it
# against labelled images whenever the model file is replaced.
CLASS_NAMES = [
    "Apple Scab",
    "Apple with Black Rot",
    "Cedar Apple Rust",
    "Healthy Apple",
    "Healthy Blueberry Plant",
    "Cherry with Powdery Mildew",
    "Healthy Cherry Plant",
    "Corn (Maize) with Cercospora and Gray Leaf Spot",
    "Corn (Maize) with Common Rust",
    "Corn (Maize) with Northern Leaf Blight",
    "Healthy Corn (Maize) Plant",
    "Grape with Black Rot",
    "Grape with Esca (Black Measles)",
    "Grape with Isariopsis Leaf Spot",
    "Healthy Grape Plant",
    "Orange with Citrus Greening",
    "Peach with Bacterial Spot",
    "Healthy Peach Plant",
    "Bell Pepper with Bacterial Spot",
    "Healthy Bell Pepper Plant",
    "Potato with Early Blight",
    "Potato with Late Blight",
    "Healthy Potato Plant",
    "Healthy Raspberry Plant",
    "Healthy Soybean Plant",
    "Squash with Powdery Mildew",
    "Strawberry with Leaf Scorch",
    "Healthy Strawberry Plant",
    "Tomato with Bacterial Spot",
    "Tomato with Early Blight",
    "Tomato with Late Blight",
    "Tomato with Leaf Mold",
    "Tomato with Septoria Leaf Spot",
    "Tomato with Spider Mites or Two-spotted Spider Mite",
    "Tomato with Target Spot",
    "Tomato Yellow Leaf Curl Virus",
    "Tomato Mosaic Virus",
    "Healthy Tomato Plant",
]


def check_model_is_trained(path: str) -> None:
    """
    Raise ValueError if the file holds never-fitted weights.
    Such a model outputs the same 1/38 score for every image. BatchNorm moving
    means stay exactly zero until a model has been fitted (or given pretrained
    weights), so all-zero means there is nothing to predict with.
    """
    moving_means = []

    def collect(name, item):
        if isinstance(item, h5py.Dataset) and name.endswith('moving_mean'):
            moving_means.append(item[()])

    with h5py.File(path, 'r') as model_file:
        model_file.get('model_weights', model_file).visititems(collect)

    if moving_means and not any(values.any() for values in moving_means):
        raise ValueError(
            "model weights are untrained (random initialization) - "
            "it was probably saved before model.fit() ran"
        )


def load_keras_model(path: str):
    """Load the .h5 file, including files saved by a newer Keras version."""
    import keras

    # Keras 3.13+ writes a quantization_config key that older versions reject
    def tolerant(layer_class):
        class TolerantLayer(layer_class):
            def __init__(self, *args, quantization_config=None, **kwargs):
                super().__init__(*args, **kwargs)

        return TolerantLayer

    custom_objects = {
        name: tolerant(getattr(keras.layers, name))
        for name in ('Dense', 'Conv2D', 'DepthwiseConv2D')
    }
    return keras.models.load_model(path, compile=False, custom_objects=custom_objects)


class PlantDiseaseModel:
    def __init__(self, path: str):
        check_model_is_trained(path)
        self.model = load_keras_model(path)

        num_outputs = self.model.output_shape[-1]
        if num_outputs != len(CLASS_NAMES):
            raise ValueError(f"expected {len(CLASS_NAMES)} output classes, model has {num_outputs}")

    def predict(self, image: Image.Image, top_k: int = 5) -> list:
        """Return the top predictions as [{"label": str, "score": float}], best first."""
        image = image.convert('RGB').resize(INPUT_SIZE, Image.Resampling.BILINEAR)

        # The model has no Rescaling layer, so scale to MobileNetV2's [-1, 1] range here
        batch = np.asarray(image, dtype='float32')[np.newaxis] / 127.5 - 1.0
        scores = np.asarray(self.model(batch, training=False))[0]

        best = np.argsort(scores)[::-1][:top_k]
        return [{"label": CLASS_NAMES[i], "score": float(scores[i])} for i in best]
