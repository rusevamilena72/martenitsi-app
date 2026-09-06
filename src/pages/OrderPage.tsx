import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function OrderPage() {
  const navigate = useNavigate();
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerDetails, setCustomerDetails] = useState('');
  const [orderDetails, setOrderDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('orders')
        .insert({
          customer_email: customerEmail,
          customer_details: customerDetails || null,
          order_details: orderDetails,
          status: 'pending',
        });

      if (insertError) {
        throw new Error('Неуспешно запазване на поръчката');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-order-email`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const emailResponse = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          customerEmail,
          customerDetails,
          orderDetails,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email notification');
      }

      setSuccess(true);
      setCustomerEmail('');
      setCustomerDetails('');
      setOrderDetails('');

      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка при изпращане на поръчката');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="flex items-center justify-center mb-6">
              <CheckCircle className="text-green-600" size={64} />
            </div>
            <h2 className="text-3xl font-bold text-gray-800 text-center mb-4">
              Поръчката е изпратена успешно!
            </h2>
            <p className="text-lg text-gray-600 text-center mb-2">
              Благодарим Ви за поръчката!
            </p>
            <p className="text-gray-600 text-center">
              Ще се свържем с Вас скоро на предоставения имейл.
            </p>
            <p className="text-sm text-gray-500 text-center mt-4">
              Пренасочване към началната страница...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-center mb-6">
          <ShoppingCart className="text-red-600 mr-3" size={40} />
          <h1 className="text-4xl font-bold text-gray-800">Направи поръчка</h1>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700 mb-2">
                Имейл <span className="text-red-600">*</span>
              </label>
              <input
                id="customerEmail"
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="example@email.com"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                На този имейл ще получите потвърждение за поръчката
              </p>
            </div>

            <div>
              <label htmlFor="customerDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Допълнителни данни
              </label>
              <textarea
                id="customerDetails"
                value={customerDetails}
                onChange={(e) => setCustomerDetails(e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Име, телефон, адрес за доставка и други допълнителни данни..."
              />
              <p className="mt-1 text-xs text-gray-500">
                Незадължително - добавете име, телефон, адрес или други данни за контакт
              </p>
            </div>

            <div>
              <label htmlFor="orderDetails" className="block text-sm font-medium text-gray-700 mb-2">
                Детайли на поръчката <span className="text-red-600">*</span>
              </label>
              <textarea
                id="orderDetails"
                value={orderDetails}
                onChange={(e) => setOrderDetails(e.target.value)}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                placeholder="Например:&#10;- Мартеница 'Мече' - 2 броя&#10;- Мартеница 'Цвете' - 1 брой&#10;- Размер: 5x5 см"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                Опишете какво искате да поръчате - име на артикули, брой, размери и др.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <p className="text-sm text-blue-800">
                <strong>Важно:</strong> След изпращане на поръчката, ще се свържем с Вас по имейл за потвърждение и детайли за доставка и плащане.
              </p>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {submitting ? 'Изпращане...' : 'Изпрати поръчка'}
              </button>
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium"
              >
                Откажи
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
