import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAppHistory, markNextNavigation } from '@/lib/navigation';

/**
 * Behaviour for header back buttons.
 *
 * `goBack('/home')` walks history back to the most recent Home entry when there
 * is one, so the page underneath keeps its scroll position and the Android
 * back button stays meaningful. With no such entry (a shared link, a reload)
 * it swaps the current entry for the parent page instead of stacking a new one.
 * Both paths leave with the outro animation.
 *
 * `goBack()` without a parent is a plain history back, falling back to Home.
 */
export function useGoBack() {
  const navigate = useNavigate();

  return useCallback(
    (parent?: string) => {
      const history = getAppHistory();

      if (!parent) {
        if (history.index > 0) {
          navigate(-1);
        } else {
          markNextNavigation('back');
          navigate('/home', { replace: true });
        }
        return;
      }

      const target = history.findBack(parent.split(/[?#]/)[0]);
      if (target >= 0) {
        navigate(target - history.index);
        return;
      }

      markNextNavigation('back');
      navigate(parent, { replace: true });
    },
    [navigate],
  );
}

export default useGoBack;
