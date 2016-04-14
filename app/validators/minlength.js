module.exports = function(length, errorMessage) {
    if (!errorMessage) errorMessage = 'This field is too short';

    return {
        validator: function(value) {
            if (value) return value.length >= length;

            return true;
        },

        message: errorMessage
    };
};
