import { useState, useEffect } from 'react';
import { FiFileText, FiPackage, FiSearch, FiShoppingCart, FiTrash2 } from 'react-icons/fi';
import { getAllMedicines, processSale } from '../api';

const POS = () => {
    const [medicines, setMedicines] = useState([]);
    const [cart, setCart] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [lastSale, setLastSale] = useState(null);
    const [loadingMedicines, setLoadingMedicines] = useState(false);
    const [checkoutLoading, setCheckoutLoading] = useState(false);

    useEffect(() => {
        loadMedicines();
    }, []);

    const loadMedicines = async () => {
        setLoadingMedicines(true);
        try {
            const response = await getAllMedicines();
            setMedicines(response.data);
        } catch (err) {
            setError('Failed to load medicines');
        } finally {
            setLoadingMedicines(false);
        }
    };

    const filteredMedicines = medicines.filter((medicine) =>
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase())
        || (medicine.brand && medicine.brand.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

    const addToCart = (medicine) => {
        if (isExpired(medicine.expiryDate)) {
            setError('Cannot add expired medicine to cart');
            return;
        }

        const existingItem = cart.find((item) => item.medicineId === medicine.id);
        if (existingItem) {
            if (existingItem.quantity >= medicine.quantity) {
                setError(`Only ${medicine.quantity} units available`);
                return;
            }
            setCart(cart.map((item) =>
                item.medicineId === medicine.id
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            ));
        } else {
            if (medicine.quantity < 1) {
                setError('Out of stock');
                return;
            }
            setCart([
                ...cart,
                {
                    medicineId: medicine.id,
                    name: medicine.name,
                    price: medicine.price,
                    quantity: 1,
                    maxQuantity: medicine.quantity,
                },
            ]);
        }
        setError('');
    };

    const updateCartQuantity = (medicineId, newQuantity) => {
        if (!Number.isFinite(newQuantity)) {
            return;
        }

        if (newQuantity < 1) {
            removeFromCart(medicineId);
            return;
        }

        const item = cart.find((i) => i.medicineId === medicineId);
        if (newQuantity > item.maxQuantity) {
            setError(`Only ${item.maxQuantity} units available`);
            return;
        }

        setCart(cart.map((i) =>
            i.medicineId === medicineId ? { ...i, quantity: newQuantity } : i
        ));
        setError('');
    };

    const removeFromCart = (medicineId) => {
        setCart(cart.filter((item) => item.medicineId !== medicineId));
    };

    const getTotal = () => cart.reduce(
        (sum, item) => sum + (parseFloat(item.price) * item.quantity),
        0,
    );

    const handleCheckout = async () => {
        if (cart.length === 0) {
            setError('Cart is empty');
            return;
        }

        setCheckoutLoading(true);
        try {
            const items = cart.map((item) => ({
                medicineId: item.medicineId,
                quantity: item.quantity,
            }));

            const response = await processSale(items);
            setLastSale(response.data);
            setSuccess('Sale completed successfully!');
            setCart([]);
            loadMedicines();
            setError('');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process sale');
        } finally {
            setCheckoutLoading(false);
        }
    };

    const clearCart = () => {
        setCart([]);
        setError('');
    };

    return (
        <div className="page-section">
            <div className="section-heading">
                <div>
                    <h2 className="section-title">Point of Sale</h2>
                    <p className="section-subtitle">Search medicines, manage the cart, and complete billing quickly.</p>
                </div>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}
            {success && <div className="alert alert-success">{success}</div>}

            <div className="row g-3">
                <div className="col-12 col-xl-7">
                    <div className="app-card h-100">
                        <div className="p-3 border-bottom">
                            <label className="form-label field-label mb-2">
                                <FiSearch aria-hidden="true" /> Search Medicines
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                placeholder="Search by medicine or brand"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="p-3 panel-scroll">
                            {loadingMedicines ? (
                                <div className="empty-state">
                                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                                    Loading medicines...
                                </div>
                            ) : filteredMedicines.length === 0 ? (
                                <div className="empty-state">
                                    <p className="mb-1 fw-semibold">No medicines found</p>
                                    <p className="mb-0 small">
                                        {searchTerm ? 'Try another search term.' : 'No items are available in inventory.'}
                                    </p>
                                </div>
                            ) : (
                                <div className="row medicine-grid">
                                    {filteredMedicines.map((medicine) => {
                                        const expired = isExpired(medicine.expiryDate);
                                        const lowStock = medicine.quantity < 10;

                                        return (
                                            <div key={medicine.id} className="col-12 col-sm-6 col-lg-4">
                                                <div className={`medicine-card h-100 ${expired ? 'expired' : lowStock ? 'low-stock' : ''}`}>
                                                    <div className="card-body d-flex flex-column">
                                                        <h6 className="card-title mb-1">{medicine.name}</h6>
                                                        <p className="card-text small text-muted mb-2">{medicine.brand || 'Generic'}</p>
                                                        <p className="medicine-price fw-bold">₹{parseFloat(medicine.price).toFixed(2)}</p>
                                                        <p className="small text-muted mb-3">Stock: {medicine.quantity}</p>

                                                        <div className="d-flex flex-wrap gap-2 mb-3">
                                                            {expired && <span className="chip chip-danger">Expired</span>}
                                                            {!expired && medicine.quantity === 0 && <span className="chip chip-danger">Out of stock</span>}
                                                            {!expired && medicine.quantity > 0 && lowStock && <span className="chip chip-warning">Low stock</span>}
                                                            {!expired && medicine.quantity > 0 && !lowStock && <span className="chip chip-success">In stock</span>}
                                                        </div>

                                                        <button
                                                            className="btn btn-sm btn-brand w-100 mt-auto"
                                                            onClick={() => addToCart(medicine)}
                                                            disabled={medicine.quantity === 0 || expired}
                                                        >
                                                            {expired ? 'Unavailable' : medicine.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-12 col-xl-5">
                    <div className="app-card">
                        <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                            <h5 className="mb-0 d-inline-flex align-items-center gap-2">
                                <FiShoppingCart aria-hidden="true" />
                                Shopping Cart
                            </h5>
                            {cart.length > 0 && (
                                <button className="btn btn-sm btn-outline-secondary" onClick={clearCart}>
                                    Clear
                                </button>
                            )}
                        </div>

                        <div className="p-3 panel-scroll-cart">
                            {cart.length === 0 ? (
                                <div className="empty-state">
                                    <p className="mb-1 fw-semibold">Cart is empty</p>
                                    <p className="mb-0 small">Add medicines to begin checkout.</p>
                                </div>
                            ) : (
                                <div className="table-responsive">
                                    <table className="table table-sm align-middle mb-0">
                                        <thead>
                                            <tr>
                                                <th>Item</th>
                                                <th>Qty</th>
                                                <th>Price</th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {cart.map((item) => (
                                                <tr key={item.medicineId}>
                                                    <td>
                                                        <div className="fw-semibold">{item.name}</div>
                                                        <div className="small text-muted">Available: {item.maxQuantity}</div>
                                                    </td>
                                                    <td>
                                                        <input
                                                            type="number"
                                                            className="form-control form-control-sm qty-input"
                                                            value={item.quantity}
                                                            onChange={(e) => updateCartQuantity(item.medicineId, Number(e.target.value))}
                                                            min="1"
                                                            max={item.maxQuantity}
                                                        />
                                                    </td>
                                                    <td>₹{(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                                                    <td>
                                                        <button
                                                            className="btn btn-sm btn-outline-danger"
                                                            onClick={() => removeFromCart(item.medicineId)}
                                                            aria-label={`Remove ${item.name}`}
                                                        >
                                                            <FiTrash2 aria-hidden="true" />
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>

                        <div className="p-3 border-top">
                            <div className="d-flex justify-content-between mb-3">
                                <h5 className="mb-0">Total</h5>
                                <h5 className="mb-0">₹{getTotal().toFixed(2)}</h5>
                            </div>
                            <button
                                className="btn btn-brand w-100"
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || checkoutLoading}
                            >
                                {checkoutLoading ? 'Processing...' : 'Checkout'}
                            </button>
                        </div>
                    </div>

                    {lastSale && (
                        <div className="app-card mt-3">
                            <div className="p-3 border-bottom d-flex justify-content-between align-items-center">
                                <h6 className="mb-0 d-inline-flex align-items-center gap-2">
                                    <FiFileText aria-hidden="true" />
                                    Receipt #{lastSale.id}
                                </h6>
                                <span className="chip chip-success">Completed</span>
                            </div>

                            <div className="p-3">
                                <p className="small text-muted mb-1">Date: {new Date(lastSale.dateTime).toLocaleString()}</p>
                                <p className="small text-muted mb-3">Cashier: {lastSale.cashierName}</p>

                                {lastSale.items.map((item, idx) => (
                                    <div key={idx} className="d-flex justify-content-between small mb-2">
                                        <span className="d-inline-flex align-items-center gap-2">
                                            <FiPackage aria-hidden="true" />
                                            {item.medicineName} x{item.quantity}
                                        </span>
                                        <span>₹{item.subtotal.toFixed(2)}</span>
                                    </div>
                                ))}

                                <hr />
                                <div className="d-flex justify-content-between fw-bold">
                                    <span>Total</span>
                                    <span>₹{lastSale.totalAmount.toFixed(2)}</span>
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
