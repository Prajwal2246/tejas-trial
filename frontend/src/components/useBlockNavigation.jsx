import { useNavigate, UNSAFE_NavigationContext } from "react-router-dom";
import { useContext, useEffect } from "react";

export default function useBlockNavigation(shouldBlock) {
  const { navigator } = useContext(UNSAFE_NavigationContext);

  useEffect(() => {
    if (!shouldBlock) return;

    const unblock = navigator.block((tx) => {
      const confirmLeave = window.confirm(
        "You have an ongoing call. Are you sure you want to leave?"
      );
      if (confirmLeave) {
        unblock();
        tx.retry(); // proceed with navigation
      }
    });

    return unblock;
  }, [navigator, shouldBlock]);
}
