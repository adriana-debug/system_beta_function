const setPageNumbers = (root = document) => {
    const pages = root.querySelectorAll('.page');
    pages.forEach((page, index) => {
        const numberSlot = page.querySelector('.page-number');
        if (numberSlot) {
            numberSlot.textContent = `Page ${index + 1}`;
        }
    });
};

const readStylesFromSheets = () => {
    try {
        return Array.from(document.styleSheets)
            .map((sheet) =>
                Array.from(sheet.cssRules || [])
                    .map((rule) => rule.cssText)
                    .join('\n')
            )
            .join('\n');
    } catch (error) {
        console.error('Unable to read stylesheet rules for Word export.', error);
        return '';
    }
};

const fetchStylesText = async () => {
    const stylesheet = document.querySelector('link[rel="stylesheet"]');
    if (!stylesheet) return '';
    try {
        const response = await fetch(stylesheet.href);
        if (response.ok) {
            return await response.text();
        }
    } catch (error) {
        console.error('Unable to fetch stylesheet for Word export.', error);
    }
    return readStylesFromSheets();
};

const buildDocHtml = (cssText, contentHtml) =>
    `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>${cssText}</style></head><body>${contentHtml}</body></html>`;

const triggerDownload = (htmlString, filename) => {
    const blob = new Blob(['\ufeff', htmlString], { type: 'application/msword' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
};

const wireDownload = () => {
    const button = document.getElementById('download-word');
    if (!button) return;

    button.addEventListener('click', async () => {
        setPageNumbers();
        const main = document.querySelector('main');
        if (!main) return;

        const mainClone = main.cloneNode(true);
        setPageNumbers(mainClone);

        const cssText = await fetchStylesText();
        const docHtml = buildDocHtml(cssText, mainClone.outerHTML);
        const safeTitle = (document.title || 'document').replace(/[\/:*?"<>|]+/g, '').replace(/\s+/g, '-').toLowerCase();
        const filename = `${safeTitle}.doc`;
        triggerDownload(docHtml, filename);
    });
};

const wireFabToggle = () => {
    const fab = document.querySelector('.fab');
    const trigger = fab?.querySelector('.fab-main');
    const links = fab?.querySelectorAll('.fab-link');
    if (!fab || !trigger) return;

    const closeFab = () => fab.classList.remove('open');

    trigger.addEventListener('click', (event) => {
        event.stopPropagation();
        fab.classList.toggle('open');
    });

    document.addEventListener('click', (event) => {
        if (!fab.contains(event.target)) closeFab();
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') closeFab();
    });

    links?.forEach((el) => el.addEventListener('click', closeFab));
};

document.addEventListener('DOMContentLoaded', () => {
    setPageNumbers();
    wireDownload();
    wireFabToggle();
});
