import { unstable_debounce as debounce } from '@mui/utils';

const debounced = debounce((value: string) => value.length, 100);
debounced('value');
debounced.clear();
debounced.flush();

// @ts-expect-error
debounced(123);
