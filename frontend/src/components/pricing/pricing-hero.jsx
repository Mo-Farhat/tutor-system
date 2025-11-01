import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import "../../css/pricing/pricing-hero.css";
import "../../css/pricing/pricing-c-selector.css";

function PricingHero() {
    const location = useLocation();
    
    const categories = [
        {
            label: 'Private Tutoring',
            sub: 'One to one lessons',
        },
        {
            label: 'Bring a Friend',
            sub: 'Save 12.5% on lessons',
        },
        {
            label: 'Bring 2 Friends',
            sub: 'Save 25% on lessons',
        },
        {
            label: 'Bring 3 Friends',
            sub: 'Save 37.5% on lessons',
        },
    ];
    
    // Get initial category from URL parameter or default to 0
    const getInitialCategory = () => {
        const params = new URLSearchParams(location.search);
        const category = params.get('category');
        console.log('🎯 Pricing Hero - URL search:', location.search);
        console.log('🎯 Pricing Hero - Category param:', category);
        if (category) {
            const index = parseInt(category, 10);
            console.log('🎯 Pricing Hero - Parsed index:', index);
            if (!isNaN(index) && index >= 0 && index < categories.length) {
                return index;
            }
        }
        return 0;
    };
    
    const [selected, setSelected] = useState(() => {
        const initial = getInitialCategory();
        console.log('🎯 Pricing Hero - Initial selected:', initial);
        return initial;
    });
    
    // Update selected category when URL changes
    useEffect(() => {
        const newCategory = getInitialCategory();
        console.log('🎯 Pricing Hero - Setting category to:', newCategory);
        setSelected(newCategory);
        // Also update localStorage and dispatch event
        localStorage.setItem('selectedPricingCategory', newCategory.toString());
        window.dispatchEvent(new CustomEvent('pricingCategoryChanged', { detail: { category: newCategory } }));
    }, [location.search]);

    const handleCategorySelect = (index) => {
        setSelected(index);
        // Store in localStorage and dispatch event for other components to listen
        localStorage.setItem('selectedPricingCategory', index.toString());
        window.dispatchEvent(new CustomEvent('pricingCategoryChanged', { detail: { category: index } }));
    };

    return (
        <section className="row container-fluid section d-flex g-0 z-index-0 pricing-hero-main" id="pricing-hero">
            <div className="row col-9 d-flex pricing-hero-sec">
                <div className="pricing-hero-pattern"></div>
                <div className="container-fluid">
                    <div className="row">
                        <div className="col-12 d-flex justify-content-end">
                            <div className="pricing-hero-content container-fluid text-end">
                                <h1 className="pricing-hero-title display-5 fw-bold text-white mb-4">
                                    Strive For Success <span><br />Expert Tutors. <br />Affordable Prices.</span>
                                </h1>
                            </div>
                        </div>
                    </div>
                </div>
                <section className="row container-fluid section d-flex g-0 z-index-0 pricing-c-selector-main" id="pricing-c-selector">
            <div className="row col-lg-9 col-md-12 d-flex pricing-c-selector-sec">
                <div className="pricing-c-selector-wrapper g-0 col-md-12 align-items-center">
                    {categories.map((cat, idx) => (
                        <button
                            key={cat.label}
                            className={`pricing-c-selector-btn btn ${selected === idx ? 'pricing-c-selector-btn-active' : ''}`}
                            onClick={() => handleCategorySelect(idx)}
                            type="button"
                        >
                            <div className="pricing-c-selector-label fw-bold">{cat.label}</div>
                            <div className="pricing-c-selector-sub">{cat.sub}</div>
                        </button>
                    ))}
                </div>
            </div>
        </section>
            </div>
        </section>
    );
}

export default PricingHero;
