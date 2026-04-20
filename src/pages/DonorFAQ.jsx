import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './DonorFAQ.css';

const ChevronIcon = ({ open }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    style={{ transition: 'transform 0.3s ease', transform: open ? 'rotate(180deg)' : 'rotate(0)' }}
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const DonorFAQ = () => {
  const navigate = useNavigate();
  const [expandedId, setExpandedId] = useState(null);

  const toggleFAQ = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const faqSections = [
    {
      title: 'Eligibility Requirements',
      faqs: [
        {
          id: 'el-1',
          q: 'Who can donate blood?',
          a: 'To be eligible to donate whole blood, you must be at least 17 years old (16 with parental consent in some cases), weigh at least 110 pounds (50 kg), and be in good general health. You must also pass a medical history screening and a mini-physical exam.',
        },
        {
          id: 'el-2',
          q: 'What is the minimum weight requirement?',
          a: 'The minimum weight requirement is typically 110 pounds (50 kg). This ensures that the volume of blood collected (approximately 450-500 mL) won\'t adversely affect your health.',
        },
        {
          id: 'el-3',
          q: 'How often can I donate blood?',
          a: 'Generally, you can donate whole blood every 56 days (approximately 8 weeks). This allows your body enough time to replenish blood cells and maintain safe hemoglobin levels.',
        },
        {
          id: 'el-4',
          q: 'Can I donate if I have tattoos or piercings?',
          a: 'Yes, you can donate if your tattoo or piercing was done by a licensed professional using sterile equipment. Tattoos and piercings done in regulated facilities do not disqualify you.',
        },
        {
          id: 'el-5',
          q: 'Are there medical conditions that prevent donation?',
          a: 'Yes, certain conditions may disqualify you from donating, including: uncontrolled diabetes, heart disease, cancer, severe anemia, hepatitis, HIV/AIDS, and active infections. Consult with our staff if you have specific health concerns.',
        },
      ],
    },
    {
      title: 'Before Donation',
      faqs: [
        {
          id: 'bd-1',
          q: 'What should I do before donating blood?',
          a: 'To prepare for donation: Get adequate sleep (7-8 hours), eat a healthy meal with iron-rich foods 2-3 hours before donation, drink plenty of water, and avoid caffeine 2 hours before.',
        },
        {
          id: 'bd-2',
          q: 'What should I eat before donation?',
          a: 'Eat iron-rich foods such as: red meat, poultry, fish, beans, fortified cereals, and leafy greens. Also include foods with vitamin C (oranges, tomatoes, peppers) to improve iron absorption. Avoid greasy or fatty foods.',
        },
        {
          id: 'bd-3',
          q: 'How much water should I drink before donating?',
          a: 'Drink at least 16 ounces (500 mL) of water or other non-caffeinated fluids in the 2-3 hours before your donation. Proper hydration helps maintain blood volume and prevents dizziness.',
        },
        {
          id: 'bd-4',
          q: 'Should I take medications before donation?',
          a: 'Take all your regular medications as prescribed. However, inform our medical staff about all medications you\'re taking, as some may affect your eligibility to donate.',
        },
        {
          id: 'bd-5',
          q: 'Can I donate if I have a cold or flu?',
          a: 'No, we recommend postponing your donation if you have symptoms of a cold, flu, or any infection. You should be symptom-free for at least 48 hours before donation.',
        },,
      ],
    },
    {
      title: 'During & After Donation',
      faqs: [
        {
          id: 'da-1',
          q: 'How long does the donation process take?',
          a: 'The entire process typically takes 45-60 minutes, including registration, medical screening, and the actual blood draw. The blood donation itself usually takes 8-10 minutes.',
        },
        {
          id: 'da-2',
          q: 'How much blood is collected?',
          a: 'A standard whole blood donation is approximately 450-500 mL (about 1 pint). This volume is about 8% of your total blood volume and is replaced by your body within a few days.',
        },
        {
          id: 'da-3',
          q: 'What should I do immediately after donation?',
          a: 'Remain seated for 10-15 minutes after donation. Drink water or juice and eat a light snack. Avoid strenuous activities, heavy lifting, or hot baths for the rest of the day.',
        },
        {
          id: 'da-4',
          q: 'Can I feel light-headed or dizzy after donation?',
          a: 'Some donors may experience mild dizziness or light-headedness. This is why we ask you to rest after donation and consume fluids. If symptoms persist, inform our staff immediately.',
        },
        {
          id: 'da-5',
          q: 'Is it normal to have bruising at the donation site?',
          a: 'Minor bruising may occur at the needle insertion site. This is usually temporary and resolves within 1-2 weeks. Apply a cold compress for the first 24 hours and avoid heavy lifting with that arm.',
        },
        {
          id: 'da-6',
          q: 'When can I resume normal activities?',
          a: 'You can return to light activities immediately. Avoid strenuous exercise, heavy lifting, or hot climates for 3-5 days. Drink extra fluids and eat iron-rich foods to help your body recover.',
        },
      ],
    },
    {
      title: 'Recovery & Care',
      faqs: [
        {
          id: 'rc-1',
          q: 'How long does it take to recover after donation?',
          a: 'Most donors feel back to normal within 24 hours. Your body replaces the fluid lost within a few hours and the blood cells within a few weeks. Red blood cells take approximately 8-12 weeks to fully replenish.',
        },
        {
          id: 'rc-2',
          q: 'What foods should I eat after donation?',
          a: 'Eat iron-rich foods: red meat, poultry, fish, beans, and spinach. Include vitamin C sources to enhance iron absorption. Stay hydrated and eat balanced meals for at least 48 hours post-donation.',
        },
        {
          id: 'rc-3',
          q: 'Can I drink alcohol after donation?',
          a: 'Avoid alcohol for at least 24 hours after donation. Alcohol can lead to dehydration and may increase the risk of complications like light-headedness.',
        },
        {
          id: 'rc-4',
          q: 'When will my blood be screened?',
          a: 'Your blood is tested for infectious diseases including HIV, hepatitis B and C, syphilis, and other pathogens. Results are typically available within a few days and we\'ll contact you if any issues are found.',
        },
        {
          id: 'rc-5',
          q: 'What if I feel unwell after donation?',
          a: 'Contact our medical team immediately if you experience severe dizziness, chest pain, shortness of breath, or any other concerning symptoms. It\'s important to report any unusual reactions.',
        },
      ],
    },
    {
      title: 'Blood Donation Facts',
      faqs: [
        {
          id: 'bf-1',
          q: 'Does blood donation hurt?',
          a: 'Most donors experience only minimal discomfort. You may feel a small pinch when the needle is inserted, but the actual donation process should be painless. If you experience pain, inform the staff.',
        },
        {
          id: 'bf-2',
          q: 'Can I donate if I\'m pregnant or breastfeeding?',
          a: 'Pregnant women should wait until at least 6 weeks after delivery to donate. If breastfeeding, you can donate, but ensure you\'re well-hydrated and in good health.',
        },
        {
          id: 'bf-3',
          q: 'What blood types are needed most?',
          a: 'O negative (universal donor) and O positive blood types are always needed. However, all blood types are valuable and essential for different patient populations.',
        },
        {
          id: 'bf-4',
          q: 'Can my blood be used if I have a rare blood type?',
          a: 'Yes! Rare blood types are extremely valuable. Patients with rare blood types often have difficulty finding compatible blood, making such donations lifesaving.',
        },
        {
          id: 'bf-5',
          q: 'How is my blood used after collection?',
          a: 'Your blood is tested, processed, and divided into components (red cells, plasma, platelets). These components are then used for different medical purposes: surgeries, trauma, anemia treatment, and more.',
        },
        {
          id: 'bf-6',
          q: 'Can I see who received my blood?',
          a: 'For privacy reasons, you typically cannot be told who specifically received your blood. However, you can feel good knowing your donation saved lives and helped your community.',
        },
      ],
    },
    {
      title: 'Common Concerns',
      faqs: [
        {
          id: 'cc-1',
          q: 'Will donating blood make me weak?',
          a: 'A single blood donation should not cause weakness if you follow proper pre-donation and post-donation guidelines. The small volume of blood lost is quickly replenished by your body.',
        },
        {
          id: 'cc-2',
          q: 'Is it safe to donate if I\'m on blood pressure medication?',
          a: 'Yes, most donors on blood pressure medication can safely donate. However, inform our staff about your medications so we can ensure your blood pressure is stable before collection.',
        },
        {
          id: 'cc-3',
          q: 'Can I donate blood if I\'m taking antibiotics?',
          a: 'It depends on the reason for antibiotics. If taking them for an active infection, wait until 48 hours after completing the course. Ask our staff for specific guidance.',
        },
        {
          id: 'cc-4',
          q: 'Is there a risk of getting an infection from blood donation?',
          a: 'No. All blood collection equipment is sterile and used only once. The risk of infection from donation is extremely minimal. All blood is thoroughly tested to ensure safety.',
        },
        {
          id: 'cc-5',
          q: 'Can I donate more blood if needed?',
          a: 'Whole blood donations must be spaced at least 56 days apart. However, plasma donation (plasmapheresis) can be done more frequently. Ask about platelet or plasma donation options.',
        },
      ],
    },
  ];

  return (
    <div className="donor-faq">
      <div className="faq-header">
        <h1>Blood Donation FAQ</h1>
        <p className="faq-subtitle">
          Everything you need to know about blood donation, eligibility, preparation, and recovery.
        </p>
      </div>

      <div className="faq-content">
        {faqSections.map((section) => (
          <div key={section.title} className="faq-section">
            <h2 className="section-title">{section.title}</h2>
            <div className="faq-list">
              {section.faqs.map((item) => (
                <div
                  key={item.id}
                  className={`faq-item ${expandedId === item.id ? 'open' : ''}`}
                >
                  <button
                    className="faq-question"
                    onClick={() => toggleFAQ(item.id)}
                  >
                    <span>{item.q}</span>
                    <ChevronIcon open={expandedId === item.id} />
                  </button>
                  {expandedId === item.id && (
                    <div className="faq-answer">
                      <p>{item.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        <div className="faq-cta">
          <div className="cta-content">
            <h3>Ready to Save Lives?</h3>
            <p>Book your next donation appointment today. Your contribution matters!</p>
            <button
              className="cta-btn"
              onClick={() => navigate('/appointment-booking')}
            >
              Book an Appointment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DonorFAQ;
