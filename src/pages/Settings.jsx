import { useState } from 'react';
import Button from '../components/ui/Button';
import { useUiStore } from '../store/uiStore';

const TABS = ['Business Info', 'AI Persona', 'Delivery Rules', 'Integrations'];

const Settings = () => {
  const [activeTab, setActiveTab] = useState(TABS[0]);
  const addToast = useUiStore((s) => s.addToast);

  const save = (e) => {
    e.preventDefault();
    addToast('Settings saved.');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Settings</h2>

      <div className="flex gap-2 border-b border-gray-200">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-5">
        {activeTab === 'Business Info' && (
          <>
            <Field label="Brand Name" defaultValue="FashionHub" />
            <Field label="Support Phone" defaultValue="+92 300 0000000" />
            <Field label="Support Email" defaultValue="support@fashionhub.pk" type="email" />
          </>
        )}

        {activeTab === 'AI Persona' && (
          <>
            <Field label="Greeting Message" as="textarea" defaultValue={'Welcome to FashionHub ❤️\nThank you for contacting us.\nHow may I help you today?'} />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reply Language</label>
              <select defaultValue="Both" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-white">
                <option>English</option>
                <option>Urdu</option>
                <option>Both</option>
              </select>
            </div>
          </>
        )}

        {activeTab === 'Delivery Rules' && (
          <>
            <Field label="Standard Delivery Charge (Rs)" defaultValue="250" type="number" />
            <Field label="Free Delivery Threshold (Rs)" defaultValue="5000" type="number" />
            <Field label="Estimated Delivery Days" defaultValue="3-5 days" />
          </>
        )}

        {activeTab === 'Integrations' && (
          <>
            <Field label="Instagram Graph API Token" defaultValue="••••••••••••" type="password" />
            <Field label="WhatsApp Business API Token" defaultValue="••••••••••••" type="password" />
            <Field label="OpenAI API Key" defaultValue="••••••••••••" type="password" />
          </>
        )}

        <div className="flex justify-end pt-4 border-t border-gray-100">
          <Button type="submit">Save Settings</Button>
        </div>
      </form>
    </div>
  );
};

const Field = ({ label, as = 'input', ...props }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
    {as === 'textarea' ? (
      <textarea rows="3" {...props} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" />
    ) : (
      <input {...props} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" />
    )}
  </div>
);

export default Settings;
