declare global {
    interface Window {
        scrollHiding: {
            header: Boolean,
            footer: Boolean,
        }
    }
}

// declare const window: Window & typeof globalThis & {
//     scrollHiding: {
//         header: Boolean,
//         footer: Boolean,
//     }
// };