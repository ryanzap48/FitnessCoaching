import { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import MealPlanCard from './mealPlan/MealPlanCard';
import { useNavigate } from 'react-router-dom';
import { FaChevronDown, FaSearch } from 'react-icons/fa';
import EditMealPlanModal from './mealPlan/EditMealPlanModal';

const MealPlanList = () => {
    const [mealPlans, setMealPlans] = useState([]);
    const [viewingDrafts, setViewingDrafts] = useState(false);
    const [sortBy, setSortBy] = useState('recent'); // 'recent' or 'active'
    const [showSortDropdown, setShowSortDropdown] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const navigate = useNavigate();
    const { token } = useAuth(); 
    const [editModeMealPlan, setEditModeMealPlan] = useState(null);
    const [isAnimating, setIsAnimating] = useState(false);

    useEffect(() => {
        fetch('http://localhost:9000/mealplans', {
            headers: { Authorization: `Bearer ${token}` },
        })
        .then(res => res.json())
        .then(data => {
            const withEmailInput = data.map(w => ({ ...w, assignEmail: '' }));
            setMealPlans(withEmailInput);
        });
    }, [token]);

    // Close dropdown when switching between views
    useEffect(() => {
        setShowSortDropdown(false);
    }, [viewingDrafts]);


    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this meal plan?')) return;

        const res = await fetch(`http://localhost:9000/mealplans/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` },
        });

        if (res.ok) {
            setMealPlans(prev => prev.filter(w => w._id !== id));
            if (editModeMealPlan?._id === id) setEditModeMealPlan(null);
        }
    };

    const handleCardClick = (mealPlan) => {
        if (mealPlan.isDraft) {
            navigate('/createmealplan', { state: { draft: mealPlan } });
        } else {
            navigate(`/mealplans/${mealPlan.slug}`);
        }
    };

    const handleConvertToDraft = async (id) => {
        const mealPlan = mealPlans.find(mp => mp._id === id);
    
        // Check if meal plan is assigned to anyone
        if (mealPlan.assignedTo && mealPlan.assignedTo.length > 0) {
            alert('Cannot convert to draft: Meal plan is currently assigned to clients.');
            return;
        }
        
        if (!window.confirm('Convert this meal plan to a draft? It will become editable again.')) return;

        try {
            const res = await fetch(`http://localhost:9000/mealplans/${id}/convert-to-draft`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` },
            });

            if (res.ok) {
                const updatedMealPlan = await res.json();
                setMealPlans(prev => 
                    prev.map(mp => 
                        mp._id === id ? { ...updatedMealPlan, assignEmail: mp.assignEmail } : mp
                    )
                );
            }
        } catch (err) {
            console.error('Error converting to draft:', err);
        }
    };

    const sortMealPlans = (plans) => {
        if (viewingDrafts) return plans;
        
        return [...plans].sort((a, b) => {
            if (sortBy === 'recent') {
                const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
                const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
                return dateB - dateA;
            } else { // 'active'
                const countA = Array.isArray(a.assignedTo) ? a.assignedTo.length : 0;
                const countB = Array.isArray(b.assignedTo) ? b.assignedTo.length : 0;
                return countB - countA;
            }
        });
    };

    

    const handleAssign = async (id, email) => {
        if (!email) return alert('Please enter a valid email.');

        const res = await fetch(`http://localhost:9000/mealplans/${id}/assign`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail: email }),
        });

        if (res.ok) {
        const updated = await res.json();
        setMealPlans(prev =>
            prev.map(w =>
            w._id === id ? { ...updated, assignEmail: '' } : w
            )
        );
        if (editModeMealPlan && editModeMealPlan._id === id) {
            setEditModeMealPlan({ ...updated, assignEmail: '' });
        }
        }
    };

    const handleUnassign = async (id, userEmail) => {
        if (!window.confirm(`Unassign ${userEmail}?`)) return;

        const res = await fetch(`http://localhost:9000/mealplans/${id}/unassign`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userEmail }),
        });

        if (res.ok) {
        const updated = await res.json();
        setMealPlans(prev =>
            prev.map(w =>
            w._id === id ? { ...updated, assignEmail: '' } : w
            )
        );
        if (editModeMealPlan && editModeMealPlan._id === id) {
            setEditModeMealPlan({ ...updated, assignEmail: '' });
        }
        }
    };



    const drafts = mealPlans.filter(mp => mp.isDraft);
    const published = sortMealPlans(mealPlans.filter(mp => !mp.isDraft));
    const visiblePlans = viewingDrafts ? drafts : published;

    const filteredPlans = visiblePlans.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (plan.description && plan.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const toggleSortDropdown = () => {
        if (!viewingDrafts) {
            if (showSortDropdown) {
                // Start closing animation
                setIsAnimating(true);
                setTimeout(() => {
                    setShowSortDropdown(false);
                    setIsAnimating(false);
                }, 200); // Match this with your transition duration
            } else {
                setShowSortDropdown(true);
            }
        }
    };

    const handleSortChange = (value) => {
        setSortBy(value);
        // Start closing animation
        setIsAnimating(true);
        setTimeout(() => {
            setShowSortDropdown(false);
            setIsAnimating(false);
        }, 200);
    };

    return (
        
        
        <div style={{ 
                padding: '1.5rem',
                margin: 'auto'
                }}>
            {/* Top Bar with Search and Create Button */}
            <div style={{
                    display: 'flex',
                    justifyContent: 'space-between', // This will maximize the gap
                    alignItems: 'center',
                    flexWrap: 'wrap', // Optional: only needed if wrapping is expected
                    marginBottom: '20px',
                    width: '100%', // Ensure the container takes full width
            }}>
                {/* Search Bar */}
                <div style={{
                    position: 'relative',
                    width: '300px'
                }}>
                    <FaSearch style={{
                        position: 'absolute',
                        left: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#999'
                    }} />
                    <input
                        type="text"
                        placeholder="Search meal plans"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '8px 10px 8px 35px',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            fontSize: '14px'
                        }}
                    />
                </div>
                <div style={{display: 'flex', gap: '2rem'}}>
                

                {/* Draft/Published toggle */}
                <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                        onClick={() => {
                            setViewingDrafts(false);
                            setShowSortDropdown(false);
                        }}
                        style={{ 
                            padding: '8px 12px',
                            fontWeight: !viewingDrafts ? 'bold' : 'normal',
                            border: '1px solid #ccc',
                            borderRadius: '25px',
                            backgroundColor: !viewingDrafts ? 'rgb(0, 0, 0, 0.2)' : '#fff'
                        }}
                    >
                        Published ({published.length})
                    </button>
                    <button
                        onClick={() => {
                            setViewingDrafts(true);
                            setShowSortDropdown(false); // Explicitly close dropdown
                        }}
                        disabled={drafts.length === 0}
                        style={{ 
                            padding: '8px 12px',
                            fontWeight: viewingDrafts ? 'bold' : 'normal',
                            border: '1px solid #ccc',
                            borderRadius: '25px',
                            backgroundColor: viewingDrafts ? 'rgb(0, 0, 0, 0.2)' : '#fff',
                            opacity: drafts.length === 0 ? 0.5 : 1
                        }}
                    >
                        Drafts ({drafts.length})
                    </button>
                </div>
                <div style={{ 
                    position: 'relative',
                    opacity: viewingDrafts ? 0.5 : 1,
                    cursor: viewingDrafts ? 'not-allowed' : 'pointer'
                }}>
                    <div 
                        onClick={toggleSortDropdown}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '7px 12px',
                            minWidth: '150px',
                            backgroundColor: '#fff',
                            pointerEvents: viewingDrafts ? 'none' : 'auto',
                            zIndex: 101 // Ensure it stays above the dropdown
                        }}
                    >
                        <span style={{color: 'rgb(0, 0, 0, .65)'}}>Sort:</span>
                        <span style={{marginLeft: '1rem'}}> {sortBy === 'recent' ? 'Most Recent' : 'Most Active'}</span>
                        <FaChevronDown size={11} style={{
                            transition: 'transform 0.2s ease',
                            transform: showSortDropdown ? 'rotate(180deg)' : 'rotate(0deg)'
                        }} />
                    </div>
                    
                    {/* Always render the dropdown for animation purposes */}
                    <div style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        backgroundColor: '#fff',
                        border: '1px solid #ccc',
                        borderRadius: '4px',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                        zIndex: 100,
                        width: '100%',
                        marginTop: '5px',
                        transform: showSortDropdown ? 'translateY(0)' : 'translateY(-10px)',
                        opacity: showSortDropdown ? 1 : 0,
                        transition: 'all 0.2s ease-out',
                        pointerEvents: showSortDropdown ? 'auto' : 'none',
                        visibility: isAnimating || showSortDropdown ? 'visible' : 'hidden'
                    }}>
                        <div 
                            onClick={() => handleSortChange('recent')}
                            style={{
                                padding: '8px 12px',
                                fontWeight: sortBy === 'recent' ? 'bold' : 'normal',
                                backgroundColor: sortBy === 'recent' ? '#f0f0f0' : 'transparent',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease'
                            }}
                        >
                            Most Recent
                        </div>
                        <div 
                            onClick={() => handleSortChange('active')}
                            style={{
                                padding: '8px 12px',
                                fontWeight: sortBy === 'active' ? 'bold' : 'normal',
                                backgroundColor: sortBy === 'active' ? '#f0f0f0' : 'transparent',
                                cursor: 'pointer',
                                transition: 'background-color 0.2s ease'
                            }}
                        >
                            Most Active
                        </div>
                    </div>
                </div>
                
                {/* Create Meal Plan Button */}
                <button
                    onClick={() => navigate('/createmealplan')}
                    style={{
                        backgroundColor: '#4285f4',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '9px 20px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '5px',
                        fontSize: '14px'
                    }}
                >
                    + Create Meal Plan
                </button>
                </div>
            </div>

       

            {/* Meal Plans Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                gap: '20px',
                padding: '10px'
            }}>
                {filteredPlans.map((mealPlan) => (
                    <MealPlanCard
                        key={mealPlan._id}
                        mealPlan={mealPlan}
                        onCardClick={() => handleCardClick(mealPlan)}
                        onEdit={setEditModeMealPlan}
                        onDelete={() => handleDelete(mealPlan._id)}
                        onConvertToDraft={!mealPlan.isDraft ? () => handleConvertToDraft(mealPlan._id) : null}                       
                    />
                ))}
            </div>

            {editModeMealPlan && (
                <EditMealPlanModal
                mealPlan={editModeMealPlan}
                isOpen={!!editModeMealPlan}
                onClose={() => setEditModeMealPlan(null)}
                onAssign={handleAssign}
                onUnassign={handleUnassign}
                />
            )}
        </div>
    );
};

export default MealPlanList;