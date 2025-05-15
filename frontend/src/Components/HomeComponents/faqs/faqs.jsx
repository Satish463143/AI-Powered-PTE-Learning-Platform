import React, { useState } from 'react'
import './faqs.css'

const faqs = () => {
    const [activeIndex, setActiveIndex] = useState(null);

    const faqData = [
        {
            question: "What is PTE Academic?",
            answer: "PTE Academic is a computer-based English language test accepted by educational institutions around the world. It assesses your English language skills in reading, writing, listening, and speaking."
        },
        {
            question: "How long does it take to prepare for PTE?",
            answer: "The preparation time varies depending on your current English level. On average, students need 4-8 weeks of dedicated preparation to achieve their desired score. Our tutors can help create a personalized study plan based on your needs."
        },
        {
            question: "What score do I need to pass PTE?",
            answer: "PTE scores range from 10-90. The required score depends on your institution or visa requirements. Most universities require a score between 50-65, while some may require higher scores for specific programs."
        },
        {
            question: "How are the tutoring sessions conducted?",
            answer: "Our tutoring sessions are conducted online through our interactive platform. You'll get one-on-one attention from experienced PTE tutors who will help you improve your skills and provide personalized feedback."
        },
        {
            question: "What materials are provided for preparation?",
            answer: "We provide comprehensive study materials including practice tests, sample questions, vocabulary lists, and speaking templates. Our tutors also share personalized tips and strategies based on your performance."
        }
    ];

    const toggleFaq = (index) => {
        setActiveIndex(activeIndex === index ? null : index);
    };

    return (
        <div className='container'>
            <div className="subtitle">
                <p>Asked Questions</p>
            </div>
            <div className="faqs_title">
                <h1>Frequently Asked Questions</h1>
            </div>   
            <div className="subtitle_2">
                <p>PTE tutor related questions</p>
            </div> 
            <div className="faq">
                {faqData.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <div 
                            className={`faq-question ${activeIndex === index ? 'active' : ''}`}
                            onClick={() => toggleFaq(index)}
                        >
                            <h3>{faq.question}</h3>
                            <span className="faq-icon">+</span>
                        </div>
                        <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
                            <p>{faq.answer}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default faqs