import { useState } from 'react';
import { Phone, Mail, MessageSquare, ShoppingCart, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function ContactPage() {
  const [showContactForm, setShowContactForm] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const { error: insertError } = await supabase
        .from('contact_messages')
        .insert({
          name,
          email,
          message,
          status: 'new',
        });

      if (insertError) {
        throw new Error('Неуспешно запазване на съобщението');
      }

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-contact-email`;
      const headers = {
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        'Content-Type': 'application/json',
      };

      const emailResponse = await fetch(apiUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name,
          email,
          message,
        }),
      });

      if (!emailResponse.ok) {
        console.error('Failed to send email notification');
      }

      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');

      setTimeout(() => {
        setSubmitted(false);
        setShowContactForm(false);
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Възникна грешка при изпращане на съобщението');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Свържи се с нас</h1>

        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">Начин на поръчване</h2>

          <div className="space-y-4 text-gray-700 leading-relaxed">
            <p className="text-lg">
              Всички поръчки, които са в наличност, се изпълняват до една седмица.
            </p>

            <p className="text-lg">
              За индивидуални поръчки, моля свържете се с нас чрез:
            </p>

            <div className="ml-6 space-y-3">
              <div className="flex items-center gap-3">
                <Phone className="text-red-600" size={20} />
                <span className="font-medium">Телефон:</span>
                <a href="tel:0878245236" className="text-red-600 hover:text-red-700 transition-colors">
                  0878 245 236
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Mail className="text-red-600" size={20} />
                <span className="font-medium">Имейл:</span>
                <a href="mailto:oblenbg@gmail.com" className="text-red-600 hover:text-red-700 transition-colors">
                  rusevamilena72@gmail.com
                </a>
              </div>

              <div className="flex items-center gap-3">
                <MessageSquare className="text-red-600" size={20} />
                <span>Използвайте бутон „Задай въпрос"</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-lg mb-2">
                <span className="font-semibold">Доставка:</span> Артикулите се доставят по пощата.
              </p>
              <p className="text-lg">
                <span className="font-semibold">Плащане:</span> Плащането е при получаване на пратката.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/order"
            className="flex items-center justify-center gap-2 bg-red-600 text-white px-8 py-4 rounded-lg hover:bg-red-700 transition-colors text-lg font-medium shadow-md hover:shadow-lg"
          >
            <ShoppingCart size={24} />
            Поръчай
          </Link>

          <button
            onClick={() => setShowContactForm(!showContactForm)}
            className="flex items-center justify-center gap-2 bg-white text-red-600 border-2 border-red-600 px-8 py-4 rounded-lg hover:bg-red-50 transition-colors text-lg font-medium shadow-md hover:shadow-lg"
          >
            <MessageSquare size={24} />
            Задай въпрос
          </button>
        </div>

        {showContactForm && (
          <div className="mt-8 bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6">Изпрати съобщение</h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md flex items-start gap-3">
                <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            {submitted ? (
              <div className="bg-green-50 border border-green-200 rounded-md p-4 text-center">
                <p className="text-green-800 font-medium">
                  Благодарим за съобщението! Ще се свържем с вас скоро.
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Име <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Имейл <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Съобщение <span className="text-red-600">*</span>
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    required
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-red-600 text-white py-3 rounded-md hover:bg-red-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    {submitting ? 'Изпращане...' : 'Изпрати'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowContactForm(false)}
                    disabled={submitting}
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-md hover:bg-gray-300 transition-colors font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                  >
                    Откажи
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
