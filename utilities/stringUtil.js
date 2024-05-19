class StringUtils {
    removeAccent(str) {
        return str.normalize('NFD')
                    .replace(/[\u0300-\u036f]/g, '')
                    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
                    .replace(/\s+/g, ' ')
    }

    reformatForUrlHandling(str) {
        return this.removeAccent(str).replace(/ /g, '-').toLowerCase();
    }
}

module.exports = new StringUtils