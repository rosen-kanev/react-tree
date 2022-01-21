import PropTypes from 'prop-types';

const getErrorForControlled = (propName, componentName, handlerName, defaultPropName) => {
    return (
        `You provided a \`${propName}\` prop to ${componentName} without an \`${handlerName}\` handler. ` +
        `This will cause the ${componentName} component to behave incorrectly. ` +
        `If the ${componentName} should be mutable use \`${defaultPropName}\` instead. Otherwise, set \`${handlerName}\`.`
    );
};

const getErrorForUncontrolled = (propName, componentName, handlerName, defaultPropName) => {
    return (
        `You provided a \`${propName}\` prop as well as a \`${defaultPropName}\` prop to ${componentName}. ` +
        `If you want a controlled component, use the \`${propName}\` prop with an \`${handlerName}\` handler. ` +
        `If you want an uncontrolled component, remove the \`${propName}\` prop and use \`${defaultPropName}\` instead.`
    );
};

const getGenericTypeError = (name, componentName, expectedType, value) => {
    return `Invalid prop \`${name}\` supplied to ${componentName}. Expected \`${expectedType}\`, received \`${
        Array.isArray(value) ? 'array' : typeof value
    }\`.`;
};

let nodeShape = {
    id: PropTypes.string.isRequired,
    label: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
};
nodeShape.nodes = PropTypes.arrayOf(PropTypes.shape(nodeShape));

const basePropTypes = {
    nodes: PropTypes.arrayOf(PropTypes.shape(nodeShape)).isRequired,

    defaultFocused: PropTypes.string,
    focused: (props, name, componentName) => {
        const value = props[name];
        const comp = `\`<${componentName}>\``;

        if (typeof value === 'string' && props.onFocusChange == null) {
            return new Error(getErrorForControlled(name, comp, 'onFocusChange', 'defaultFocused'));
        }

        if (value != null && props.defaultFocused != null) {
            return new Error(getErrorForUncontrolled(name, comp, 'onFocusChange', 'defaultFocused'));
        }

        if (value != null && typeof value !== 'string') {
            return new Error(getGenericTypeError(name, comp, 'string', value));
        }

        return null;
    },
    onFocusChange: PropTypes.func,

    defaultExpanded: PropTypes.arrayOf(PropTypes.string),
    expanded: (props, name, componentName) => {
        const value = props[name];
        const comp = `\`<${componentName}>\``;

        if (Array.isArray(value) && props.onExpandChange == null) {
            return new Error(getErrorForControlled(name, comp, 'onExpandChange', 'defaultExpanded'));
        }

        if (value != null && props.defaultExpanded != null) {
            return new Error(getErrorForUncontrolled(name, comp, 'onExpandChange', 'defaultExpanded'));
        }

        if (Array.isArray(value)) {
            const message = `You provided an array as \`${name}\` in ${comp} but one or more of the values are not string.`;

            return value.some((i) => typeof i !== 'string') ? new Error(message) : null;
        }

        if (value != null && !Array.isArray(value)) {
            return new Error(getGenericTypeError(name, comp, 'array', value));
        }

        return null;
    },
    onExpandChange: PropTypes.func,

    selectionTogglesExpanded: PropTypes.bool,
    selectionFollowsFocus: PropTypes.bool,

    defaultSelected: PropTypes.string,
    selected: (props, name, componentName) => {
        const value = props[name];
        const comp = `\`<${componentName}>\``;

        if (typeof value === 'string' && props.onSelectChange == null) {
            return new Error(getErrorForControlled(name, comp, 'onSelectChange', 'defaultSelected'));
        }

        if (value != null && props.defaultSelected != null) {
            return new Error(getErrorForUncontrolled(name, comp, 'onSelectChange', 'defaultSelected'));
        }

        if (value != null && typeof value !== 'string') {
            return new Error(getGenericTypeError(name, comp, 'string', value));
        }

        return null;
    },
    onSelectChange: PropTypes.func,

    renderLabel: (props, name, componentName) => {
        const value = props[name];
        const comp = `\`<${componentName}>\``;

        if (typeof value !== 'function') {
            const stack = [...props.nodes];

            while (stack.length) {
                const node = stack.pop();

                if (node.label == null) {
                    const message =
                        `You didn't provide a \`renderLabel\` function in ${comp} ` +
                        `but one or more values in the \`nodes\` prop don't have a valid \`label\` prop.`;

                    return new Error(message);
                }

                stack.push(...node.nodes);
            }
        }

        return null;
    },
};

export default basePropTypes;
