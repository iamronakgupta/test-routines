import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { fetchCategories, fetchProducts } from '../api'
import ProductCard from '../components/ProductCard'

export default function CatalogPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const selectedCategorySlug = searchParams.get('category') || ''
  const searchTerm = searchParams.get('q') || ''

  const [categories, setCategories] = useState([])
  const [products, setProducts] = useState([])
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    fetchCategories().then(setCategories).catch((error) => setErrorMessage(error.message))
  }, [])

  useEffect(() => {
    fetchProducts({ categorySlug: selectedCategorySlug, searchTerm })
      .then(setProducts)
      .catch((error) => setErrorMessage(error.message))
  }, [selectedCategorySlug, searchTerm])

  function updateFilter(paramName, value) {
    const nextParams = new URLSearchParams(searchParams)
    if (value) nextParams.set(paramName, value)
    else nextParams.delete(paramName)
    setSearchParams(nextParams, { replace: paramName === 'q' })
  }

  return (
    <>
      <div className="catalog-toolbar">
        <nav className="category-tabs">
          <button className={!selectedCategorySlug ? 'active' : ''} onClick={() => updateFilter('category', '')}>
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={selectedCategorySlug === category.slug ? 'active' : ''}
              onClick={() => updateFilter('category', category.slug)}
            >
              {category.name}
            </button>
          ))}
        </nav>
        <input
          type="search"
          placeholder="Search products…"
          value={searchTerm}
          onChange={(event) => updateFilter('q', event.target.value)}
        />
      </div>
      {errorMessage && <p className="error">{errorMessage}</p>}
      {products.length === 0 && !errorMessage && <p className="muted">No products found.</p>}
      <section className="product-grid">
        {products.map((product) => <ProductCard key={product.id} product={product} />)}
      </section>
    </>
  )
}
