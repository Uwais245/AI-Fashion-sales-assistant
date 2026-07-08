// Placeholder data until the backend team wires up the real endpoints.
// Field names match the MongoDB schema in the project spec — see API_CONTRACT.md.

export let products = [
  { id: 'p1', name: 'Black Embroidered Maxi', category: 'Women', price: 4999, description: 'Elegant embroidered maxi dress, perfect for Eid and formal occasions.', sizes: ['S', 'M', 'L', 'XL'], colors: ['Black'], stock: 15, discount: 0, rating: 4.8, image: null },
  { id: 'p2', name: 'Black Chiffon Dress', category: 'Women', price: 5499, description: 'Flowing chiffon dress with delicate detailing.', sizes: ['S', 'M', 'L'], colors: ['Black'], stock: 6, discount: 10, rating: 4.6, image: null },
  { id: 'p3', name: 'Men Classic White Shirt', category: 'Men', price: 2500, description: 'Crisp cotton formal shirt.', sizes: ['M', 'L', 'XL'], colors: ['White'], stock: 30, discount: 0, rating: 4.5, image: null },
  { id: 'p4', name: 'Summer Floral Dress', category: 'Women', price: 3499, description: 'Light floral dress for warm days.', sizes: ['S', 'M', 'L'], colors: ['Multi'], stock: 8, discount: 15, rating: 4.2, image: null },
  { id: 'p5', name: 'Leather Belt', category: 'Accessories', price: 1500, description: 'Genuine leather belt, brown and black.', sizes: ['One Size'], colors: ['Brown', 'Black'], stock: 40, discount: 0, rating: 4.4, image: null },
  { id: 'p6', name: 'Black Jeans', category: 'Men', price: 3200, description: 'Slim-fit black denim.', sizes: ['30', '32', '34', '36'], colors: ['Black'], stock: 3, discount: 0, rating: 4.3, image: null },
];

export let customers = [
  { id: 'c1', name: 'Ayesha Khan', phone: '+92 300 1234567', instagramId: '@ayesha.k', address: 'F-8, Islamabad', preferences: 'Dresses, Summer', orderHistory: ['o2'] },
  { id: 'c2', name: 'Ali Raza', phone: '+92 321 7654321', instagramId: '@aliraza99', address: 'DHA, Lahore', preferences: 'Shirts, Casual', orderHistory: ['o1'] },
  { id: 'c3', name: 'Sara Ahmed', phone: '+92 333 9876543', instagramId: '@sara.styles', address: 'Clifton, Karachi', preferences: 'Accessories', orderHistory: [] },
  { id: 'c4', name: 'Hamza Tariq', phone: '+92 345 1112233', instagramId: '@hamzat', address: 'Gulberg, Lahore', preferences: 'Belts, Formal', orderHistory: ['o3'] },
];

export let orders = [
  { id: 'o1', orderId: '#ORD-001', customerId: 'c2', customerName: 'Ali Raza', products: [{ productId: 'p3', name: 'Black Shirt', qty: 1 }], status: 'Delivered', paymentStatus: 'Paid', trackingNumber: 'TCS-89012', amount: 2500, date: '2026-06-25' },
  { id: 'o2', orderId: '#ORD-002', customerId: 'c1', customerName: 'Ayesha Khan', products: [{ productId: 'p4', name: 'Floral Dress', qty: 2 }], status: 'Pending', paymentStatus: 'Unpaid', trackingNumber: null, amount: 6998, date: '2026-06-29' },
  { id: 'o3', orderId: '#ORD-003', customerId: 'c4', customerName: 'Hamza Tariq', products: [{ productId: 'p5', name: 'Leather Belt', qty: 1 }], status: 'Shipped', paymentStatus: 'Paid', trackingNumber: 'LEP-34567', amount: 1500, date: '2026-06-30' },
];

export let conversations = [
  {
    id: 'conv1',
    customerName: 'Ayesha',
    channel: 'Instagram',
    status: 'ai-handling',
    lastMessage: 'Yes, show pictures of the Maxi.',
    intent: 'Product Search',
    sentiment: 'Interested',
    messages: [
      { sender: 'customer', text: 'I need a black dress for Eid', time: '10:00 AM' },
      { sender: 'ai', text: 'I found these options for you:\n1. Black Embroidered Maxi - Rs 4,999\n2. Black Chiffon Dress - Rs 5,499\nWould you like to see pictures?', time: '10:01 AM' },
      { sender: 'customer', text: 'Yes, show pictures of the Maxi.', time: '10:05 AM' },
    ],
  },
  {
    id: 'conv2',
    customerName: 'Ali Raza',
    channel: 'WhatsApp',
    status: 'ai-handling',
    lastMessage: 'Delivery charges?',
    intent: 'Delivery Inquiry',
    sentiment: 'Neutral',
    messages: [
      { sender: 'customer', text: 'Delivery charges?', time: '9:40 AM' },
      { sender: 'ai', text: 'Delivery is Rs 250 nationwide, free above Rs 5,000.', time: '9:41 AM' },
    ],
  },
  {
    id: 'conv3',
    customerName: 'Sara Ahmed',
    channel: 'Instagram',
    status: 'flagged',
    lastMessage: 'This is the second time my order is late!!',
    intent: 'Complaint',
    sentiment: 'Angry',
    messages: [
      { sender: 'customer', text: 'This is the second time my order is late!!', time: '11:20 AM' },
      { sender: 'ai', text: 'I\'m very sorry for the delay. Let me check your order status right away.', time: '11:21 AM' },
    ],
  },
];

export let aiRules = [
  { id: 'r1', intent: 'Delivery Queries', trigger: 'Do you deliver to Islamabad? What are the charges?', response: 'Yes, we deliver nationwide. Delivery charges to Islamabad are Rs. 250.' },
  { id: 'r2', intent: 'Greeting', trigger: 'Hi / Hello', response: 'Welcome to FashionHub! How may I help you today?' },
];

export const currentAdmin = { id: 'admin1', name: 'Admin', email: 'admin@fashionhub.pk', role: 'admin' };

let idCounter = 100;
export const nextId = (prefix) => `${prefix}${idCounter++}`;
