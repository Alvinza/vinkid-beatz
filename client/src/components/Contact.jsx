import React from 'react'
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; 
import { motion } from "motion/react" // motion for animation

const Contact = () => {
    // State to manage form submission result
    const [result, setResult] = React.useState("");

    // Handle form submission
    const onSubmit = async (event) => {
        event.preventDefault();     
        // Set loading state
        setResult("Sending....");
        
        // Create form data
        const formData = new FormData(event.target);
        // access key for Web3Forms
        formData.append("access_key", "ac0ea1e3-87c3-4016-8df4-9f62d0403230");
        
        // Submit form data to Web3Forms
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          body: formData
        });
        
        // Parse response
        const data = await response.json();
        
        // Handle successful submission
        if (data.success) {
          setResult("");
          toast.success("Email submitted successfully");
          event.target.reset();
        }
        // Handle submission error
        else {
          console.log("Error", data);
          setResult(data.message);
          toast.error(data.message)
          setResult("");
        }
    };

    return (
        // Animated contact section with motion
        <motion.div
        initial={{opacity: 0, x:-200}}
        transition={{duration: 1}}
        whileInView={{opacity: 1, x:0}}
        viewport={{once: true}}
        className='text-center p-6 py-20 lg:px-32 w-full overflow-hidden ' id='Contact' style={{marginTop: "-22px"}}>
             {/* Section title */}
             <h1 className='text-2xl sm:text-4xl font-bold mb-2 text-center'>Contact
             <span className=' underline underline-offset-4 decoration-1 under font-light'>With Us</span></h1>
            
            {/* Subtitle */}
            <p className='text-gray-500 max-w-80 text-center mb-12 mx-auto'>Ready to
            make a move? Let's build your future together</p>
            
            {/* Contact form */}
            <form onSubmit={onSubmit} className='max-w-2xl mx-auto text-gray-600 pt-8'>
                {/* Name and Email inputs in flex layout */}
                <div className='flex flex-wrap'>
                    <div className='w-full md:w-1/2 text-left'>Your name
                    <input className='w-full border border-fuchsia-700 rounded py-3
                    px-4 mt-2' type="text" name='Name' placeholder='Your name' required />
                    </div>
                    <div className='w-full md:w-1/2 text-left md:pl-4'>Your email
                    <input className='w-full border border-fuchsia-700 rounded py-3
                    px-4 mt-2' type="email" name='Email' placeholder='Your Email' required />
                    </div>
                </div>
                
                {/* Message textarea */}
                <div className='my-6 text-left'>
                    Message
                    <textarea className='w-full border border-gray-300 rounded py-3
                    px-4 mt-2 h-48 resize-none '
                     name="Message" placeholder='Message here...' required></textarea>
                </div>
                
                {/* Submit button */}
                <div className="contact-button">
                <button>{result ? result : 'Send Message'}</button>
                </div>
            </form>
        </motion.div>
    )
}
export default Contact
