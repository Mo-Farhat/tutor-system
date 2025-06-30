# Subject selection data for tutoring platform

YEAR_11_12_SUBJECTS = {
    "VCE": [
        "Physics", "Chemistry", "Biology", "General Maths", "Mathematical Methods", 
        "Specialist Mathematics", "Further Mathematics", "Legal Studies", "Business", 
        "Psychology", "Economics", "English Literature", "English Language", 
        "Health and Human Development", "English as an Additional Language (EAL)", 
        "Accounting", "Ancient History", "Geography", "History Revolutions", "French", 
        "Latin", "Japanese", "Environmental Science", "UCAT", "Physical Education", 
        "Music Performance", "Philosophy", "Engineering", "Politics"
    ],
    "QCE": [
        "English", "Chemistry", "Biology", "Physics", "General Maths", "Mathematical Methods", 
        "Specialist Mathematics", "UCAT", "Legal Studies", "Business", "Economics", 
        "English Literature", "English as an Additional Language (EAL)", "Accounting", 
        "Modern History", "Ancient History", "English Literature and Extension 1", 
        "Study of Religion", "French", "Japanese", "Physical Education", "Music Performance", 
        "Philosophy", "Engineering"
    ],
    "SACE": [
        "Mathematical Methods", "English", "Chemistry", "Biology", "Physics", 
        "Specialist Mathematics", "General Maths", "UCAT", "Legal Studies", "Business", 
        "Psychology", "Economics", "English as an Additional Language (EAL)", "Accounting", 
        "Research Project", "Modern History", "Ancient History", "Geography", "Japanese", 
        "French", "Physical Education", "Music Performance", "Literary Studies"
    ],
    "HSC": [
        "Chemistry", "Biology", "Physics", "Advanced Mathematics", "UCAT", "Legal Studies", 
        "Business", "Psychology", "Economics", "English Literature", "English Advanced", 
        "Extension 1 Mathematics", "English Standard", "English as an Additional Language (EAL)", 
        "Accounting", "Standard Maths", "Extension 2 Mathematics", "Modern History", 
        "Personal Development, Health and Physical Education", "Ancient History", 
        "English Literature and Extension 1", "English Extension 2", "Geography", 
        "Study of Religion", "French", "Latin", "Japanese", "Society and Culture", 
        "Music Performance", "Philosophy", "Engineering"
    ],
    "WACE": [
        "Mathematical Methods", "English", "Chemistry", "Biology", "Physics", 
        "Specialist Mathematics", "General Maths", "UCAT", "Business", "Psychology", 
        "Economics", "Literature", "Mathematics Applications", "Human Biology", 
        "English as an Additional Language (EAL)", "Accounting", "Modern History", 
        "Geography", "French", "Politics and Law", "Japanese", "Physical Education", 
        "Philosophy"
    ],
    "NTCET": [
        "Mathematical Methods", "English", "Chemistry", "Biology", "Physics", 
        "Specialist Mathematics", "General Maths", "UCAT", "Legal Studies", "Business", 
        "Psychology", "Economics", "English as an Additional Language (EAL)", "Accounting", 
        "Research Project", "Modern History", "Ancient History", "Geography", "Japanese", 
        "French", "Physical Education", "Music Performance", "Literary Studies"
    ],
    "BSSS": [
        "English", "Chemistry", "Biology", "Physics", "General Maths", "Legal Studies", 
        "Economics", "English Literature", "Accounting", "Study of Religion", "Philosophy"
    ],
    "IB": [
        "IB Chemistry SL", "IB Chemistry HL", "IB Business Management SL", 
        "IB Mathematics Analysis and Approaches SL", "IB Mathematics: Analysis and Approaches HL", 
        "IB Economics SL", "IB Economics HL", "IB Biology SL", "IB Biology HL", 
        "IB English Language & Literature SL", "IB English Language & Literature HL", 
        "IB English Literature SL", "IB English Literature HL", 
        "IB Mathematics Analysis & Interpretation SL", "IB Mathematics Analysis & Interpretation HL", 
        "IB History SL", "IB History HL", "IB Geography SL", "IB Geography HL", 
        "IB Chinese B SL", "IB Chinese ab initio", "IB Spanish ab initio", "IB Spanish B SL", 
        "IB Music SL", "IB Psychology SL", "IB Psychology HL", "IB Business Management HL", 
        "IB Physics SL", "IB Physics HL"
    ],
    "Medical Entrance": [
        "UCAT", "GAMSAT", "Interview Preparation", "Application Support"
    ]
}

YEAR_1_10_SUBJECTS = {
    "Victoria": [
        "Maths", "English", "Science", "Selective Entry", "English as an Additional Language (EAL)", 
        "Music Performance"
    ],
    "Queensland": [
        "Maths", "English", "Science", "Selective Entry", "English as an Additional Language (EAL)", 
        "Music Performance"
    ],
    "South Australia": [
        "Maths", "English", "Science", "Selective Entry", "English as an Additional Language (EAL)", 
        "Music Performance"
    ],
    "New South Wales": [
        "Maths", "English", "Science", "Selective Entry", "English as an Additional Language (EAL)", 
        "Music Performance"
    ],
    "Western Australia": [
        "Maths", "English", "Science", "Selective Entry", "English as an Additional Language (EAL)", 
        "Music Performance"
    ],
    "Northern Territory": [
        "Maths", "English", "Science", "Selective Entry", "English as an Additional Language (EAL)", 
        "Music Performance"
    ],
    "Australian Capital Territory": [
        "Maths", "English", "Science", "Selective Entry", "English as an Additional Language (EAL)", 
        "Music Performance"
    ],
    "Tasmania": [
        "Maths", "English", "Science", "Selective Entry", "English as an Additional Language (EAL)", 
        "Music Performance"
    ]
}

# Curriculum to state mapping for easier filtering
CURRICULUM_TO_STATE = {
    "VCE": "Victoria",
    "QCE": "Queensland", 
    "SACE": "South Australia",
    "HSC": "New South Wales",
    "WACE": "Western Australia",
    "NTCET": "Northern Territory",
    "BSSS": "Australian Capital Territory",
    "IB": "International",  # IB can be in any state
    "Medical Entrance": "National"  # Medical entrance exams are national
}

# Year level options
YEAR_LEVELS = [
    "Year 1-10",
    "Year 11/12"
]

# Available curricula for Year 11/12
CURRICULA = list(YEAR_11_12_SUBJECTS.keys())

# Available states for Year 1-10
STATES = list(YEAR_1_10_SUBJECTS.keys()) 