import React from "react";
import {motion} from 'motion/react'

const Faq = () => {
  return (
    // Animated container with motion library
    <motion.div
    initial={{opacity: 0, y:100}}
    transition={{duration: 1.5}}
    whileInView={{opacity: 1, y:0}}
    viewport={{once: true}}>
    <div style={{ padding: "2rem" }}>
      <section className="faq" id="faq">
        <div className="heading">
          <h1>FAQ</h1>
          <h2>Frequently Asked Questions</h2>
        </div>
        
        {/* Dynamically render FAQ items */}
        <div className="faq-content">
          {faqData.map((faq, index) => (
            <div key={index} className="faq-item">
              {/* Display question with numbered index */}
              <h1>{`${index + 1}: ${faq.question}`}</h1>
              <p dangerouslySetInnerHTML={{ __html: faq.answer }} />
            </div>
          ))}
        </div>
      </section>
    </div>
    </motion.div>
  );
};

// FAQ Data for Reusability
const faqData = [
  {
    question: "What does it mean to lease a beat?",
    answer:
      "When you purchase a beat lease, you are simply buying the rights to use the beat in a limited and non-exclusive capacity. Vinkid Beatz retains ownership over the musical composition (just the instrumental).",
  },
  {
    question: "Is it safe to buy beats from Vinkid Beatz?",
    answer:
      "Yes, all payments are being processed through Stripe and PayPal, one of the most secure and popular checkout systems in the world. Stripe allows you to pay securely via Credit/Debit-Card super fast and convenient.",
  },
  {
    question: "What bulk discounts do you have and how do I get them?",
    answer:
      "I am currently running the following deals on multi-beat purchases:<br>Buy 1, Get 1 Free: Simply add 2 beats of the same license type to your cart and 1 of them will be for free.",
  },
  {
    question: "Do the beats I purchase come with tags?",
    answer: "All beats come untagged.",
  },
  {
    question: "When will I receive my beat(s)?",
    answer:
      "Your beat(s) will be instantly available for download directly from the order summary page once you checkout and your payment has been processed. Additionally, an email will be sent to the address provided at checkout with the download links immediately after purchase. Be sure to check your spam folder if you don’t see the email right away. If you have any trouble accessing the files, email me at vinkidbeatz@email.com.",
  },
  {
    question: "What are stems (trackouts)?",
    answer: "Stems (also known as trackouts) are the individual audio files that make up a beat, meaning each sound within the beat will be sent as a separate high quality WAV audio file. Leases that include stems are ideal if you plan on recording your song in a professional studio and want to have full control over mixing each instrument around your vocals.",
  },
  {
    question: "Can I buy beats from my mobile device?",
    answer: "Yes, but certain mobile devices can have compatibility issues when downloading the files directly to the phone. It is advisable to download the files to your desktop or laptop using the link in the confirmation email you’ll receive after a successful checkout. Don’t worry if you navigate away from the order summary page on your phone, you’ll be linked back to it in the email to get your files.",
  },
  {
    question: "What if I purchase a license and then later on, someone else purchases the Exclusive Rights?",
    answer: "The purchase of Exclusive Rights to a beat does not impact the status or validity of previous licensees so you do not need to remove your music from streaming services, social media, etc. for the full term of your lease agreement.",
  },
  {
    question: "What’s the difference between an Unlimited License and an Exclusive?",
    answer: "The usage rights are the same for both: you get unlimited sales, streams, etc. The difference is, if you purchase the Exclusive, the ownership rights to the beat are transferred to you and the beat is immediately removed from my beat store, never to be sold to another artist again. The Unlimited License is still non-exclusive, so even though you get the same usage rights as if you owned the Exclusive, the beat will remain in my beat store for others to lease or buy.",
  },
  {
    question: "How much are the Exclusive Rights to a beat?",
    answer: "Exclusive Rights pricing is variable and negotiable.Email me at vinkidbeatz@gmail.com for more information.",
  },
  {
    question: "Can I use your Beat for free?",
    answer: "Absolutely, any of my beats are only free to use for non-profit purposes. This means that you are allowed to record a demo for further evaluation purposes. All use requires credit in the title and description, In order to release on streaming platforms like Spotify, Apple Music, YouTube, Soundcloud and similar you will have to purchase a lease.",
  },
  {
    question: "Do you offer refunds? I accidentally bought the wrong beat.",
    answer: "In general, due to this being a digital download product, no refunds can be accepted. However I am always open to find a solution, if you simply choose the wrong beat. In this case, please don't hesitate to contact me at vinkidbeatz@gmail.com",
  },
  {
    question: "Can you edit a beat for me?",
    answer: "I only do very simple edits as that is all I have time to accommodate. If it is a matter of simply extending or shortening the beat, or taking out an instrument or sound, that should be fine, just email me and i'll let you know if it is possible. If it is more than that I will likely not be able to do it so I recommend purchasing the stems/trackouts and editing either yourself or having an engineer/producer help with it",
  }
];

export default Faq;
