import { useState, useEffect } from 'react';
import { getAllMedicines, processSale } from '../api';

const POS = () => {
    const [medicines, setMedicines] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lastSale, setLastSale] = useState(null);

    useEffect(() => {
        loadMedicines();
    }, []);

    const loadMedicines = async () => {
        try {
            const response = await getAllMedicines();
            setMedicines(response.data);
        } catch (err) {
            setError('Failed to load medicines');
        }
    };

    const filteredMedicines = medicines.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.brand && m.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

    const addToCart = (medicine) => {
        if (isExpired(medicine.expiryDate)) {
            setError('Cannot add expired medicine to cart');
            return;
        }

        const existingItem = cart.find(item => item.medicineId === medicine.id);
        if (existingItem) {
            if (existingItem.quantity >= medicine.quantity) {
                setError(`Only ${medicine.quantity} units available`);
                return;
            }
            setCart(cart.map(item =>
                item.medicineId === medicine.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            if (medicine.quantity < 1) {
                setError('Out of stock');
                return;
            }
            setCart([...cart, {
                medicineId: medicine.id,
                name: medicine.name,
                price: medicine.price,
                quantity: 1,
                maxQuantity: medicine.quantity
            }]);
        }
        setError('');
    };

    const updateCartQuantity = (medicineId, newQuantity) => {
        if (newQuantity < 1) {
            removeFromCart(medicineId);
            return;
        }
        const item = cart.find(i => i.medicineId === medicineId);
        if (newQuantity > item.maxQuantity) {
            setError(`Only ${item.maxQuantity} units available`);
            return;
        }
        setCart(cart.map(i =>
            i.medicineId === medicineId ? { ...i, quantity: newQuantity } : i
        ));
        setError('');
    };

    const removeFromCart = (medicineId) => {
        setCart(cart.filter(item => item.medicineId !== medicineId));
    };

    const getTotal = () => {
        // Parse to float to avoid floating-point rounding from JSON BigDecimal
        return cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            setError('Cart is empty');
            return;
        }

        try {
            const items = cart.map(item => ({
                medicineId: item.medicineId,
                quantity: item.quantity
            }));
            const response = await processSale(items);
            setLastSale(response.data);
            setSuccess('Sale completed successfully!');
            setCart([]);
            loadMedicines();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process sale');
        }
    };

    const clearCart = () => {
        setCart([]);
        setError('');
    };

    return (
        <div className="container-fluid mt-4">
            <h2>Point of Sale</h2>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="row">
                {/* Medicine Selection */}
                <div className="col-md-7">
                    <div className="card">
                        <div className="card-header">
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search medicines..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="card-body" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                            <div className="row">
                                {filteredMedicines.map(medicine => (
                                    <div key={medicine.id} className="col-md-4 mb-3">
                                        <div className={`card h-100 ${isExpired(medicine.expiryDate) ? 'border-danger' : medicine.quantity < 10 ? 'border-warning' : ''}`}>
                                            <div className="card-body">
                                                <h6 className="card-title">{medicine.name}</h6>
                                                <p className="card-text small text-muted">{medicine.brand}</p>
                                                <p className="card-text">
                                                    <strong>₹{parseFloat(medicine.price).toFixed(2)}</strong>
                                                    <br />
                                                    <small>Stock: {medicine.quantity}</small>
                                                </p>
                                                {isExpired(medicine.expiryDate) ? (
                                                    <span className="badge bg-danger">Expired</span>
                                                ) : (
                                                    <button
                                                        className="btn btn-sm btn-primary w-100"
                                                        onClick={() => addToCart(medicine)}
                                                        disabled={medicine.quantity === 0}
                                                    >
                                                        {medicine.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cart */}
                <div className="col-md-5">
                    <div className="card">
                        <div className="card-header bg-primary text-white d-flex justify-content-between">
                            <span>Shopping Cart</span>
                            {cart.length > 0 && (
                                <button className="btn btn-sm btn-light" onClick={clearCart}>
                                    Clear
                                </button>
                            )}
                        </div>
                        <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            {cart.length === 0 ? (
                                <p className="text-muted text-center">Cart is empty</p>
                            ) : (
                                <table className="table table-sm">
                                    <thead>
                                        <tr>
                                            <th>Item</th>
                                            <th>Qty</th>
                                            <th>Price</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {cart.map(item => (
                                            <tr key={item.medicineId}>
                                                <td>{item.name}</td>
                                                <td>
                                                    <input
                                                        type="number"
                                                        className="form-control form-control-sm"
                                                        style={{ width: '60px' }}
                                                        value={item.quantity}
                                                        onChange={(e) => updateCartQuantity(item.medicineId, parseInt(e.target.value))}
                                                        min="1"
                                                        max={item.maxQuantity}
                                                    />
                                                </td>
                                                <td>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                                <td>
                                                    <button
                                                        className="btn btn-sm btn-outline-danger"
                                                        onClick={() => removeFromCart(item.medicineId)}
                                                    >
                                                        ×
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                        </div>
                        <div className="card-footer">
                            <div className="d-flex justify-content-between mb-3">
                                <h5>Total:</h5>
                                <h5>₹{getTotal().toFixed(2)}</h5>
                            </div>
                            <button
                                className="btn btn-success w-100"
                                onClick={handleCheckout}
                                disabled={cart.length === 0}
                            >
                                Checkout
                            </button>
                        </div>
                    </div>

                    {/* Last Sale Receipt */}
                    {lastSale && (
                        <div className="card mt-3">
                            <div className="card-header bg-success text-white">
                                Receipt - Sale #{lastSale.id}
                            </div>
                            <div className="card-body">
                                <p><small>Date: {new Date(lastSale.dateTime).toLocaleString()}</small></p>
                                <p><small>Cashier: {lastSale.cashierName}</small></p>
                                <hr />
                                {lastSale.items.map((item, idx) => (
                                    <div key={idx} className="d-flex justify-content-between">
                                        <span>{item.medicineName} x{item.quantity}</span>
                                        <span>₹{item.subtotal.toFixed(2)}</span>
                                    </div>
                                ))}
                                <hr />
                                <div className="d-flex justify-content-between">
                                    <strong>Total</strong>
                                    <strong>₹{lastSale.totalAmount.toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default POS;
