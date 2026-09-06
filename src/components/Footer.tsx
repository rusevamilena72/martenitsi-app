export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">За нас</h3>
            <p className="text-gray-400 text-sm">
              Вашият онлайн магазин за уникални ръчно изработени мартеници.
            </p>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Категории</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Комплекти</li>
              <li>Уникални</li>
              <li>Гривни</li>
              <li>Цветя</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Контакти</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Email: rusevamilena72@gmail.com</li>
              <li>Тел: +359 878 245 236</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} Мартеници. Всички права запазени.</p>
        </div>
      </div>
    </footer>
  );
}
