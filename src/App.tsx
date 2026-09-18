import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './pages/Home'
import { Story } from './pages/Story'
import { Rooms } from './pages/Rooms'
import { RoomDetail } from './pages/RoomDetail'
import { Dining } from './pages/Dining'
import { About } from './pages/About'
import { Access } from './pages/Access'
import { Faq } from './pages/Faq'
import { Contact } from './pages/Contact'
import { Reserve } from './pages/Reserve'
import { ReserveConfirm } from './pages/ReserveConfirm'
import { Sitemap } from './pages/Sitemap'
import { NotFound } from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/story" element={<Story />} />
          <Route path="/rooms" element={<Rooms />} />
          <Route path="/rooms/:slug" element={<RoomDetail />} />
          <Route path="/dining" element={<Dining />} />
          <Route path="/about" element={<About />} />
          <Route path="/access" element={<Access />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/reserve" element={<Reserve />} />
          <Route path="/reserve/:id" element={<ReserveConfirm />} />
          <Route path="/sitemap" element={<Sitemap />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
