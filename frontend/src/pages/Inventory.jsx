import { useState, useEffect } from 'react';
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
    const { user } = useAuth();

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

    const handleSearch = async () => {
        if (searchTerm.trim()) {
            try {
                const response = await searchMedicines(searchTerm);
                setMedicines(response.data);
            } catch (err) {
                setError('Search failed');
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
                quantity: parseInt(formData.quantity),
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

    return (
        <div className="container-fluid mt-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h2>Inventory Management</h2>
                <button className="btn btn-primary" onClick={openAddModal}>
                    + Add Medicine
                </button>
            </div>

            {error && <div className="alert alert-danger">{error}</div>}

            <div className="row mb-3">
                <div className="col-md-4">
                    <div className="input-group">
                        <input
                            type="text"
                            className="form-control"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                        />
                        <button className="btn btn-outline-secondary" onClick={handleSearch}>
                            Search
                        </button>
                        <button className="btn btn-outline-secondary" onClick={() => { setSearchTerm(''); loadMedicines(); }}>
                            Clear
                        </button>
                    </div>
                </div>
            </div>

            <div className="table-responsive">
                <table className="table table-striped table-hover">
                    <thead className="table-dark">
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
                            <tr
                                key={medicine.id}
                                className={`${isExpired(medicine.expiryDate) ? 'table-danger' : 
                                    isExpiringSoon(medicine.expiryDate) ? 'table-warning' : 
                                    isLowStock(medicine.quantity) ? 'table-info' : ''}`}
                            >
                                <td>{medicine.id}</td>
                                <td>{medicine.name}</td>
                                <td>{medicine.brand}</td>
                                <td>{medicine.batchNo}</td>
                                <td>
                                    {medicine.quantity}
                                    {isLowStock(medicine.quantity) &&
                                        <span className="badge bg-warning ms-2">Low Stock</span>}
                                </td>
                                <td>₹{medicine.price.toFixed(2)}</td>
                                <td>
                                    {medicine.expiryDate}
                                    {isExpired(medicine.expiryDate) &&
                                        <span className="badge bg-danger ms-2">Expired</span>}
                                    {!isExpired(medicine.expiryDate) && isExpiringSoon(medicine.expiryDate) &&
                                        <span className="badge bg-warning ms-2">Expiring Soon</span>}
                                </td>
                                <td>
                                    <button
                                        className="btn btn-sm btn-outline-primary me-1"
                                        onClick={() => handleEdit(medicine)}
                                    >
                                        Edit
                                    </button>
                                    {user?.role === 'ADMIN' && (
                                        <button
                                            className="btn btn-sm btn-outline-danger"
                                            onClick={() => handleDelete(medicine.id)}
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">
                                    {editingMedicine ? 'Edit Medicine' : 'Add Medicine'}
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
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
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                            required
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Brand</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.brand}
                                            onChange={(e) => setFormData({...formData, brand: e.target.value})}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="form-label">Batch No</label>
                                        <input
                                            type="text"
                                            className="form-control"
                                            value={formData.batchNo}
                                            onChange={(e) => setFormData({...formData, batchNo: e.target.value})}
                                        />
                                    </div>
                                    <div className="row">
                                        <div className="col-md-6 mb-3">
                                            <label className="form-label">Quantity *</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                value={formData.quantity}
                                                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
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
                                                onChange={(e) => setFormData({...formData, price: e.target.value})}
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
                                            onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button
                                        type="button"
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                    <button type="submit" className="btn btn-primary">
                                        {editingMedicine ? 'Update' : 'Add'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Inventory;
