import React, { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { getTutorById } from "../../services/authService"
import * as Snippets from "../../components/snippets/snippets-index"
import * as Tutorcomponents from "../../components/tutor/tutor-index"

const Tutorpage = () => {
    const { id } = useParams();
    const [tutorData, setTutorData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchTutorData();
        } else {
            // If no ID, use default data for the static page
            setTutorData(getDefaultTutorData());
        }
    }, [id]);

    const fetchTutorData = async () => {
        try {
            setLoading(true);
            const result = await getTutorById(id);
            
            if (result.success) {
                setTutorData(result.data);
            } else {
                setError(result.error || 'Failed to load tutor details');
            }
        } catch (err) {
            setError('Error loading tutor: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const getDefaultTutorData = () => {
        return {
            user: {
                first_name: "Enola",
                last_name: "Holmes",
                profile_picture: null
            },
            bio: "Yorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus. Sed dignissim, metus nec fringilla accumsan, risus sem sollicitudin lacus, ut interdum tellus elit sed risus. Maecenas eget condimentum velit, sit amet feugiat lectus. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Praesent auctor purus luctus enim egestas, ac scelerisque ante pulvinar. Donec ut rhoncus ex. Suspendisse ac rhoncus nisl, eu tempor urna. Curabitur vel bibendum lorem. Morbi convallis convallis diam sit amet lacinia. Aliquam in elementum. Curabitur tempor quis eros tempus lacinia. Nam bibendum pellentesque quam.",
            university: "Queensland Academy for Science, Mathematics and Technology",
            current_study: "Medicine",
            atar: "94.27",
            hourly_rate: "30",
            experience_years: 3,
            total_lessons: 82,
            subjects_selected: [
                "IB Chemistry HL Year 11-12",
                "IB Biology HL Year 11-12", 
                "IB Biology SL Year 11-12",
                "Maths Year 5-10",
                "Science Year 5-10",
                "Maths Year 1-4",
                "Mathematics Applications Year 11-12"
            ],
            preferred_locations: ["Online", "Tingalpa", "Camp hill", "Buderim"],
            tutor_contract_status: "approved",
            wwcc_status: "approved",
            rating: "4.5"
        };
    };

    const getDefaultImage = (name) => {
        const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const avatarId = (seed % 99) + 1;
        const gender = seed % 2 === 0 ? 'women' : 'men';
        return `https://randomuser.me/api/portraits/${gender}/${avatarId}.jpg`;
    };

    if (loading) {
        return (
            <div className="tutor-container">
                <Snippets.Navbar />
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
                    <div className="text-center">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading tutor details...</span>
                        </div>
                        <p className="mt-3">Loading tutor information...</p>
                    </div>
                </div>
                <Snippets.Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="tutor-container">
                <Snippets.Navbar />
                <div className="container mt-5">
                    <div className="alert alert-danger" role="alert">
                        <h4>Error Loading Tutor</h4>
                        <p>{error}</p>
                        <button className="btn btn-primary" onClick={() => window.history.back()}>
                            Go Back
                        </button>
                    </div>
                </div>
                <Snippets.Footer />
            </div>
        );
    }

    return (
        <div className="tutor-container">
            <Snippets.Navbar />
            <Tutorcomponents.TutorTop tutorData={tutorData} getDefaultImage={getDefaultImage} />
            <Tutorcomponents.TutorInfo tutorData={tutorData} />
            <Tutorcomponents.TutorFaq />
            <Snippets.Footer />
        </div>
    );
};

export default Tutorpage;