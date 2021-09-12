import { useState, useCallback } from 'react';

import { isUndefined, isFn } from './utils';

const useInternalState = (valueProp, defaultValue) => {
    const [valueState, setValueState] = useState(defaultValue);
    const isUncontrolled = isUndefined(valueProp);
    const value = isUncontrolled ? valueState : valueProp;

    const updateValue = useCallback(
        (next) => {
            if (isUncontrolled) {
                setValueState(next);
            }
        },
        [isUncontrolled, value]
    );

    return [value, updateValue];
};

export default useInternalState;
