import { useState, useRef, useEffect } from "react";
import { getLiveTutors } from "../../services/authService";
import "../../css/find-tutor/findt-tutors.css"

function FindtTutors() {
    const [tutors, setTutors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchLiveTutors();
    }, []);

    const fetchLiveTutors = async () => {
        try {
            setLoading(true);
            const result = await getLiveTutors();
            
            if (result.success) {
                setTutors(result.data.tutors || []);
            } else {
                setError(result.error || 'Failed to load tutors');
            }
        } catch (err) {
            setError('Error loading tutors: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getDefaultImage = (name) => {
        // Generate a consistent avatar based on the tutor's name
        const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const avatarId = (seed % 99) + 1;
        const gender = seed % 2 === 0 ? 'women' : 'men';
        return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
    };

    if (loading) {
        return (
            <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
                <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                    <div className="d-flex justify-content-center align-items-center w-100" style={{ minHeight: '400px' }}>
                        <div className="text-center">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading tutors...</span>
                            </div>
                            <p className="mt-3">Finding the best tutors for you...</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    if (error) {
        return (
            <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
                <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                    <div className="alert alert-danger w-100" role="alert">
                        {error}
                        <button 
                            className="btn btn-primary ms-3" 
                            onClick={fetchLiveTutors}
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </section>
        );
    }

    if (tutors.length === 0) {
        return (
            <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
                <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                    <div className="text-center w-100" style={{ minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div>
                            <i className="fas fa-user-graduate fa-4x text-muted mb-3"></i>
                            <h3>No tutors available</h3>
                            <p>We're working on getting more tutors approved. Check back soon!</p>
                        </div>
                    </div>
                </div>
            </section>
        );
    }

    return (
        <section className='row container-fluid d-flex g-0 findt-tutors-main' id='findt-tutors'>
            <div className="col-lg-8 col-sm-12 mx-sm-0 mx-lg-auto d-flex findt-tutors-sec">
                <div className="row g-4 w-100">
                    {tutors.map((tutor) => (
                        <div key={tutor.id} className="col-xl-3 col-lg-4 col-md-6 col-12">
                            <a href={`/tutor/${tutor.id}`} className="findt-tutors-card">
                                <div className="findt-tutors-stats">
                                    <span className="findt-tutors-gold">Gold ({tutor.goldPoints})</span>
                                    <span className="findt-tutors-atr">ATAR ({tutor.atrPoints})</span>
                                </div>
                                <div className={`findt-tutors-avatar ${tutor.status.toLowerCase()}`}>
                                    <img 
                                        src={tutor.image || getDefaultImage(tutor.name)} 
                                        alt={tutor.name}
                                        onError={(e) => {
                                            e.target.src = getDefaultImage(tutor.name);
                                        }}
                                    />
                                    <span className="findt-tutors-status">{tutor.status}</span>
                                </div>
                                <h3 className="findt-tutors-name">{tutor.name}</h3>
                                <p className="findt-tutors-description">
                                    {tutor.bio || `${tutor.name} is a qualified tutor specializing in ${tutor.subjects?.slice(0, 2).join(', ') || 'various subjects'}.`}
                                </p>
                            </a>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}

export default FindtTutors;