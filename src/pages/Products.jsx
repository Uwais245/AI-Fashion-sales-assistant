import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { FiEdit, FiTrash2, FiPlus } from 'react-icons/fi';
import { useProducts, useCreateProduct, useUpdateProduct, useDeleteProduct } from '../hooks/useProducts';
import DataTable from '../components/DataTable';
import Modal from '../components/ui/Modal';
import ConfirmDialog from '../components/ui/ConfirmDialog';
import Button from '../components/ui/Button';
import SearchBar from '../components/ui/SearchBar';

const productSchema = z.object({
  name: z.string().min(2, 'Product name is required'),
  category: z.string().min(1),
  price: z.coerce.number().positive('Price must be greater than 0'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative'),
  sizes: z.string().min(1, 'List at least one size'),
  colors: z.string().min(1, 'List at least one color'),
  description: z.string().optional(),
  discount: z.coerce.number().min(0).max(100).optional(),
});

const Products = () => {
  const { data: products, isLoading } = useProducts();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  });

  const openCreate = () => {
    setEditingProduct(null);
    reset({ name: '', category: 'Women', price: '', stock: '', sizes: '', colors: '', description: '', discount: 0 });
    setIsModalOpen(true);
  };

  const openEdit = (product) => {
    setEditingProduct(product);
    reset({
      ...product,
      sizes: product.sizes?.join(', '),
      colors: product.colors?.join(', '),
    });
    setIsModalOpen(true);
  };

  const onSubmit = async (values) => {
    const payload = {
      ...values,
      sizes: values.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      colors: values.colors.split(',').map((c) => c.trim()).filter(Boolean),
    };
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, payload });
    } else {
      await createProduct.mutateAsync(payload);
    }
    setIsModalOpen(false);
  };

  const filtered = (products || []).filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { key: 'name', header: 'Product Name', render: (p) => <span className="font-medium text-gray-800">{p.name}</span> },
    { key: 'category', header: 'Category', render: (p) => <span className="text-gray-600">{p.category}</span> },
    { key: 'price', header: 'Price', render: (p) => <span className="font-medium text-gray-800">Rs {p.price.toLocaleString()}</span> },
    {
      key: 'stock',
      header: 'Stock',
      render: (p) => (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${p.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {p.stock} in stock
        </span>
      ),
    },
    { key: 'rating', header: 'Rating', render: (p) => <span className="text-orange-500 font-medium">★ {p.rating}</span> },
    {
      key: 'actions',
      header: 'Actions',
      align: 'center',
      render: (p) => (
        <div className="flex justify-center gap-4">
          <button onClick={() => openEdit(p)} className="text-blue-500 hover:text-blue-700 transition"><FiEdit size={18} /></button>
          <button onClick={() => setDeletingProduct(p)} className="text-red-500 hover:text-red-700 transition"><FiTrash2 size={18} /></button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Products Management</h2>
        <Button onClick={openCreate}><FiPlus /> Add Product</Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <SearchBar value={search} onChange={setSearch} placeholder="Search by name or category..." />
        </div>
        <DataTable
          columns={columns}
          data={filtered}
          isLoading={isLoading}
          emptyTitle="No products yet"
          emptyDescription="Add your first product to start building the catalog."
        />
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingProduct ? 'Edit Product' : 'Add New Product'}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input {...register('name')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Black Dress" />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
            <select {...register('category')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none bg-white">
              <option>Men</option>
              <option>Women</option>
              <option>Accessories</option>
            </select>
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Price (Rs)</label>
            <input type="number" {...register('price')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 4999" />
            {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Stock Quantity</label>
            <input type="number" {...register('stock')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. 50" />
            {errors.stock && <p className="text-xs text-red-500 mt-1">{errors.stock.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Sizes</label>
            <input {...register('sizes')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. S, M, L, XL" />
            {errors.sizes && <p className="text-xs text-red-500 mt-1">{errors.sizes.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Available Colors</label>
            <input {...register('colors')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="e.g. Black, Red" />
            {errors.colors && <p className="text-xs text-red-500 mt-1">{errors.colors.message}</p>}
          </div>
          <div className="col-span-2 sm:col-span-1">
            <label className="block text-sm font-medium text-gray-700 mb-1">Discount (%)</label>
            <input type="number" {...register('discount')} className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="0" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea {...register('description')} rows="3" className="w-full border border-gray-300 rounded-lg p-2.5 focus:ring-2 focus:ring-primary outline-none" placeholder="Product details..." />
          </div>

          <div className="col-span-2 flex justify-end gap-3 mt-4 pt-4 border-t border-gray-100">
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" isLoading={createProduct.isPending || updateProduct.isPending}>
              {editingProduct ? 'Save Changes' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingProduct}
        onClose={() => setDeletingProduct(null)}
        onConfirm={async () => {
          await deleteProduct.mutateAsync(deletingProduct.id);
          setDeletingProduct(null);
        }}
        title="Delete product?"
        description={`This will permanently remove "${deletingProduct?.name}" from the catalog.`}
        isLoading={deleteProduct.isPending}
      />
    </div>
  );
};

export default Products;
