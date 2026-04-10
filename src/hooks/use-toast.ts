export type ToastOptions = {
  title: string
  description?: string
}

export const toast = ({ title, description }: ToastOptions) => {
  console.log('[TOAST]', title, description)
}
