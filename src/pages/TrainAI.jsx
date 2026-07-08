import { useForm } from 'react-hook-form';
import { FiTrash2 } from 'react-icons/fi';
import { useAiRules, useCreateAiRule, useDeleteAiRule } from '../hooks/useAiTraining';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';

const INTENTS = ['Greeting', 'Product Search', 'Delivery Queries', 'Price & Discount Queries', 'Return & Exchange', 'Order Tracking', 'Complaint'];

const TrainAI = () => {
  const { data: rules, isLoading } = useAiRules();
  const createRule = useCreateAiRule();
  const deleteRule = useDeleteAiRule();
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const onSubmit = async (values) => {
    await createRule.mutateAsync(values);
    reset({ intent: values.intent, trigger: '', response: '' });
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Train AI Responses</h2>
        <p className="text-gray-500 mt-1">Add custom rules and responses for the AI Assistant.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Intent / Category</label>
            <select {...register('intent', { required: true })} defaultValue={INTENTS[2]} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-white">
              {INTENTS.map((i) => <option key={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">If Customer Asks (Keywords / Example)</label>
            <input
              {...register('trigger', { required: 'This field is required' })}
              placeholder="e.g. Do you deliver to Islamabad? What are the charges?"
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
            />
            {errors.trigger && <p className="text-xs text-red-500 mt-1">{errors.trigger.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">AI Should Reply</label>
            <textarea
              {...register('response', { required: 'This field is required' })}
              rows="4"
              placeholder="e.g. Yes, we deliver nationwide. Delivery charges to Islamabad are Rs. 250."
              className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none"
            />
            {errors.response && <p className="text-xs text-red-500 mt-1">{errors.response.message}</p>}
          </div>

          <div className="flex justify-end pt-4 border-t border-gray-100">
            <Button type="submit" isLoading={createRule.isPending}>Save AI Rule</Button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="font-bold text-gray-800 mb-4">Existing Rules</h3>
        {isLoading ? (
          <p className="text-sm text-gray-400">Loading...</p>
        ) : rules?.length === 0 ? (
          <EmptyState title="No rules yet" description="Rules you save above will show up here." />
        ) : (
          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="border border-gray-100 rounded-lg p-4 flex justify-between gap-4">
                <div>
                  <span className="text-xs font-medium text-primary bg-indigo-50 px-2 py-0.5 rounded-full">{rule.intent}</span>
                  <p className="text-sm text-gray-700 mt-2"><span className="text-gray-400">If: </span>{rule.trigger}</p>
                  <p className="text-sm text-gray-700"><span className="text-gray-400">Reply: </span>{rule.response}</p>
                </div>
                <button onClick={() => deleteRule.mutate(rule.id)} className="text-red-400 hover:text-red-600 transition shrink-0">
                  <FiTrash2 />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainAI;
