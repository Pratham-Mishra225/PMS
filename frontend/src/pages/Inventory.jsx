import { useState, useEffect } from 'react';
import { FiEdit2, FiPackage, FiPlus, FiSearch, FiTrash2, FiXCircle } from 'react-icons/fi';
import { getAllMedicines, addMedicine, updateMedicine, deleteMedicine, searchMedicines } from '../api';
import { useAuth } from '../AuthContext';

const Inventory = () => {
    const [medicines, setMedicines] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [editingMedicine, setEditingMedicine] = useState(null);
    const [formData, setFormData] = useState({
        name: '', brand: '', batchNo: '', quantity: '', price: '', expiryDate: ''
    });
    const [error, setError] = useState('');
    const [loadingMedicines, setLoadingMedicines] = useState(false);
    const { user } = useAuth();

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

    const handleSearch = async () => {
        if (searchTerm.trim()) {
            setLoadingMedicines(true);
            try {
                const response = await searchMedicines(searchTerm);
                setMedicines(response.data);
            } catch (err) {
                setError('Search failed');
            } finally {
                setLoadingMedicines(false);
            }
        } else {
            loadMedicines();
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const medicineData = {
                ...formData,
                quantity: parseInt(formData.quantity, 10),
                price: parseFloat(formData.price)
            };
            if (editingMedicine) {
                await updateMedicine(editingMedicine.id, medicineData);
            } else {
                await addMedicine(medicineData);
            }
            setShowModal(false);
            resetForm();
            loadMedicines();
        } catch (err) {
            console.error('Error saving medicine:', err);
            const errorMessage = err.response?.data?.message || err.message || 'Failed to save medicine. Please check if the backend server is running.';
            setError(errorMessage);
        }
    };

    const handleEdit = (medicine) => {
        setEditingMedicine(medicine);
        setFormData({
            name: medicine.name,
            brand: medicine.brand || '',
            batchNo: medicine.batchNo || '',
            quantity: medicine.quantity.toString(),
            price: medicine.price.toString(),
            expiryDate: medicine.expiryDate
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this medicine?')) {
            try {
                await deleteMedicine(id);
                loadMedicines();
            } catch (err) {
                setError('Failed to delete medicine');
            }
        }
    };

    const resetForm = () => {
        setFormData({ name: '', brand: '', batchNo: '', quantity: '', price: '', expiryDate: '' });
        setEditingMedicine(null);
    };

    const openAddModal = () => {
        resetForm();
        setShowModal(true);
    };

    const isLowStock = (quantity) => quantity < 10;
    const isExpiringSoon = (expiryDate) => {
        const expiry = new Date(expiryDate);
        const thirtyDaysFromNow = new Date();
        thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
        return expiry <= thirtyDaysFromNow;
    };
    const isExpired = (expiryDate) => new Date(expiryDate) < new Date();

    useEffect(() => {
        if (!showModal) {
            return undefined;
        }

        const handleEscape = (event) => {
            if (event.key === 'Escape') {
                setShowModal(false);
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [showModal]);

    const getRowClassName = (medicine) => {
        if (isExpired(medicine.expiryDate)) {
            return 'inventory-row-expired';
        }

        if (isExpiringSoon(medicine.expiryDate)) {
            return 'inventory-row-warning';
        }

        if (isLowStock(medicine.quantity)) {
            return 'inventory-row-info';
        }

        return '';
    };

    return (
        <div className="page-section">
            <div className="section-heading">
                <div>
                    <h2 className="section-title">Inventory Management</h2>
                    <p className="section-subtitle">Track stock levels, expiries, and pricing in one place.</p>
                </div>
                <button className="btn btn-brand" onClick={openAddModal}>
                    <FiPlus className="me-2" aria-hidden="true" />
                    Add Medicine
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="inventory-toolbar">
                <div className="input-group inventory-search">
                    <span className="input-group-text">
                        <FiSearch aria-hidden="true" />
                    </span>
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search by medicine name"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                    <button className="btn btn-outline-secondary" onClick={handleSearch}>
                        Search
                    </button>
                    <button
                        className="btn btn-outline-secondary"
                        onClick={() => {
                            setSearchTerm('');
                            loadMedicines();
                        }}
                    >
                        Clear
                    </button>
                </div>
                <span className="chip chip-success">{medicines.length} items</span>
            </div>

            {loadingMedicines ? (
                <div className="empty-state">
                    <div className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></div>
                    Loading inventory...
                </div>
            ) : medicines.length === 0 ? (
                <div className="empty-state">
                    <p className="fw-semibold mb-1 d-inline-flex align-items-center gap-2">
                        <FiPackage aria-hidden="true" />
                        No medicines found
                    </p>
                    <p className="mb-0 small">Try a different search term or add a new medicine.</p>
                </div>
            ) : (
                <div className="inventory-table-wrap table-responsive">
                    <table className="table table-hover align-middle inventory-table">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Name</th>
                                <th>Brand</th>
                                <th>Batch No</th>
                                <th>Quantity</th>
                                <th>Price (₹)</th>
                                <th>Expiry Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {medicines.map((medicine) => (
                                <tr key={medicine.id} className={getRowClassName(medicine)}>
                                    <td>{medicine.id}</td>
                                    <td className="fw-semibold">{medicine.name}</td>
                                    <td>{medicine.brand || '-'}</td>
                                    <td>{medicine.batchNo || '-'}</td>
                                    <td>
                                        {medicine.quantity}
                                        {isLowStock(medicine.quantity) && (
                                            <span className="chip chip-warning ms-2">Low stock</span>
                                        )}
                                    </td>
                                    <td>₹{medicine.price.toFixed(2)}</td>
                                    <td>
                                        {medicine.expiryDate}
                                        {isExpired(medicine.expiryDate) && (
                                            <span className="chip chip-danger ms-2">Expired</span>
                                        )}
                                        {!isExpired(medicine.expiryDate) && isExpiringSoon(medicine.expiryDate) && (
                                            <span className="chip chip-warning ms-2">Expiring soon</span>
                                        )}
                                    </td>
                                    <td>
                                        <button
                                            className="btn btn-sm btn-outline-primary me-2"
                                            onClick={() => handleEdit(medicine)}
                                        >
                                            <FiEdit2 className="me-1" aria-hidden="true" />
                                            Edit
                                        </button>
                                        {user?.role === 'ADMIN' && (
                                            <button
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => handleDelete(medicine.id)}
                                            >
                                                <FiTrash2 className="me-1" aria-hidden="true" />
                                                Delete
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="custom-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="custom-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="medicine-modal-title">
                        <div className="modal-header">
                            <h5 className="modal-title" id="medicine-modal-title">
                                <FiPackage className="me-2" aria-hidden="true" />
                                    {editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
                            </h5>
                            <button
                                type="button"
                                className="btn-close"
                                aria-label="Close"
                                onClick={() => setShowModal(false)}
                            ></button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="mb-3">
                                    <label className="form-label">Name *</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.name}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Brand</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.brand}
                                        onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Batch No</label>
                                    <input
                                        type="text"
                                        className="form-control"
                                        value={formData.batchNo}
                                        onChange={(e) => setFormData({ ...formData, batchNo: e.target.value })}
                                    />
                                </div>
                                <div className="row">
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Quantity *</label>
                                        <input
                                            type="number"
                                            className="form-control"
                                            value={formData.quantity}
                                            onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                    <div className="col-md-6 mb-3">
                                        <label className="form-label">Price (₹) *</label>
                                        <input
                                            type="number"
                                            step="0.01"
                                            className="form-control"
                                            value={formData.price}
                                            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                            required
                                            min="0"
                                        />
                                    </div>
                                </div>
                                <div className="mb-3">
                                    <label className="form-label">Expiry Date *</label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={formData.expiryDate}
                                        onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setShowModal(false)}
                                >
                                    <FiXCircle className="me-1" aria-hidden="true" />
                                    Cancel
                                </button>
                                <button type="submit" className="btn btn-brand">
                                    {editingMedicine ? 'Update Medicine' : 'Add Medicine'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
