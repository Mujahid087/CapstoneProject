import AppRoutes from './routes/AppRoutes'
import { ToastContainer } from 'react-toastify'
import { useTheme } from './theme/useTheme.jsx'

function App() {
  const { theme } = useTheme()

  return (
    <>
      <AppRoutes />
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} closeOnClick pauseOnHover theme={theme} />
    </>
  )
}

export default App
