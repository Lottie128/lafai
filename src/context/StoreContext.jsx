import { createContext, useContext, useState, useEffect } from 'react'
import defaultSettings from '../data/settings.json'
import defaultContent from '../data/content.json'
import defaultProducts from '../data/products.json'

const StoreContext = createContext(null)

export function StoreProvider({ children }) {
  const [settings, setSettings] = useState(() => {
    try {
      const stored = localStorage.getItem('lafai_settings')
      return stored ? JSON.parse(stored) : defaultSettings
    } catch {
      return defaultSettings
    }
  })

  const [content, setContent] = useState(() => {
    try {
      const stored = localStorage.getItem('lafai_content')
      return stored ? JSON.parse(stored) : defaultContent
    } catch {
      return defaultContent
    }
  })

  const [products, setProducts] = useState(() => {
    try {
      const stored = localStorage.getItem('lafai_products')
      return stored ? JSON.parse(stored) : defaultProducts
    } catch {
      return defaultProducts
    }
  })

  const updateSettings = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem('lafai_settings', JSON.stringify(newSettings))
  }

  const updateContent = (newContent) => {
    setContent(newContent)
    localStorage.setItem('lafai_content', JSON.stringify(newContent))
  }

  const updateProducts = (newProducts) => {
    setProducts(newProducts)
    localStorage.setItem('lafai_products', JSON.stringify(newProducts))
  }

  const formatPrice = (amount) => {
    const { symbol } = settings.currency
    return `${symbol}${Number(amount).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
  }

  return (
    <StoreContext.Provider
      value={{
        settings,
        content,
        products,
        updateSettings,
        updateContent,
        updateProducts,
        formatPrice,
      }}
    >
      {children}
    </StoreContext.Provider>
  )
}

export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used within StoreProvider')
  return ctx
}
