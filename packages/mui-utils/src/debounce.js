// Corresponds to 10 frames at 60 Hz.
// A few bytes payload overhead when lodash/debounce is ~3 kB and debounce ~300 B.
export default function debounce(func, wait = 166) {
  let timeout;
  let pending;
  function debounced(...args) {
    pending = () => {
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(debounced.flush, wait);
  }

  debounced.clear = () => {
    clearTimeout(timeout);
    pending = undefined;
  };

  debounced.flush = () => {
    const task = pending;
    debounced.clear();
    if (task) {
      task();
    }
  };

  return debounced;
}
