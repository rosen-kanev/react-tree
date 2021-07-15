import { useState, useCallback } from 'react';

const useInternalState = ({ value: valueProp, defaultValue, onChange }) => {
    const [valueState, setValueState] = useState(defaultValue);
    const isUncontrolled = typeof valueProp === 'undefined';
    const value = isUncontrolled ? valueState : valueProp;

    const updateValue = useCallback(
        (updater) => {
            const nextValue = typeof updater === 'function' ? updater(value) : updater;

            if (isUncontrolled) {
                setValueState(nextValue);
            }

            onChange(nextValue);
        },
        [isUncontrolled, onChange, value]
    );

    return [value, updateValue];
};

export default useInternalState;
