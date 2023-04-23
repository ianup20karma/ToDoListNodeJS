exports.getDate = (lang) => {
    const options = {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
    };
    return new Date().toLocaleDateString(lang, options);
};