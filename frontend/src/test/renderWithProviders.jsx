import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { CartProvider } from '../CartContext'

// Renders UI inside the same providers main.jsx uses. Pass `routePath` (e.g.
// "/products/:slug") when the component reads route params.
export function renderWithProviders(ui, { initialPath = '/', routePath } = {}) {
  const user = userEvent.setup()
  const routedUi = routePath ? <Routes><Route path={routePath} element={ui} /></Routes> : ui

  return {
    user,
    ...render(
      <MemoryRouter initialEntries={[initialPath]}>
        <CartProvider>{routedUi}</CartProvider>
      </MemoryRouter>,
    ),
  }
}

// Stubs global fetch so each request path returns the given JSON body.
export function mockApiResponses(responsesByPath) {
  return vi.spyOn(globalThis, 'fetch').mockImplementation(async (requestPath) => {
    const matchedPath = Object.keys(responsesByPath).find((path) => String(requestPath).startsWith(path))
    const body = matchedPath ? responsesByPath[matchedPath] : { errors: ['Not found'] }
    return new Response(JSON.stringify(body), { status: matchedPath ? 200 : 404 })
  })
}
