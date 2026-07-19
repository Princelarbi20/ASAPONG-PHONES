export function formatPrice(price) {
    if (price === null || price === undefined) return "GH₵ 0";

    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return "GH₵ 0";

    // Prices are currency values: always show two decimals and thousands
    // separators (e.g. GH₵ 3,433.00).
    const formatted = numPrice.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    return `GH₵ ${formatted}`;
}
