import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { TextInputComponent } from '../../Common/form/form'



const signUp = () => {  
    const [loading, setLoading] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);

    const registerDTO = Yup.object({
        name: Yup.string().min(2).max(50).required(),
        email: Yup.string().email().required(),
        password: Yup.string()
          .min(8, "Password must be at least 8 characters")
            .max(16, "Password must not exceed 16 characters")
            .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
            .matches(/[a-z]/, "Password must contain at least one lowercase letter") 
            .matches(/[0-9]/, "Password must contain at least one number")
          .required(),
        confirmPassword: Yup.string()
          .oneOf([Yup.ref("password")], "Password and comfirm password must match")
          .required(),
        
      });

      const {  handleSubmit, control,formState: { errors }, } = useForm({
        resolver: yupResolver(registerDTO),
        });

        const register = ()=>{
            setLoading(true)
            try{

            }catch(exception){

            }finally{
                setLoading(false)
            }
        }
    


  return (
    <div className="auth-page container">
      <motion.div 
        className="auth-page__container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="auth-page__title">Create Account</h1>
        
        <form onSubmit={handleSubmit(register)} className="auth-page__form">
          <div className="auth-page__form-group">
            <label htmlFor="name" className="auth-page__label">
              Full Name
            </label>
            <TextInputComponent
                control={control}
                name="name"
                errMsg={errors?.name?.message || null}
                required:true
            />
          </div>
          
          <div className="auth-page__form-group">
            <label htmlFor="email" className="auth-page__label">
              Email Address
            </label>
            <TextInputComponent
                control={control}
                name="email"
                errMsg={errors?.email?.message || null}
                required:true
            />
          </div>
          
          <div className="auth-page__form-group">
            <label htmlFor="password" className="auth-page__label">
              Password
            </label>
                <TextInputComponent
                    name="password"
                    type="password"
                    errMsg={errors?.password?.message || null}
                    required:true
                    control={control}
                />
          </div>
          
          <div className="auth-page__form-group">
            <label htmlFor="confirm-password" className="auth-page__label">
              Confirm Password
            </label>
            <TextInputComponent
                    name="confirmPassword"
                    type="password"
                    errMsg={errors?.confirmPassword?.message || null}
                    required:true
                    control={control}
                />
            
          </div>
          
          <div className="auth-page__checkbox-container">
            <input
              id="terms"
              type="checkbox"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="auth-page__checkbox"
              required
            />
            <label htmlFor="terms" className="auth-page__checkbox-label">
              I agree to the{' '}
              <Link to="/terms"> <span>Terms of Service</span></Link>{' '}
              and{' '}
              <Link to="/privacy"> <span>Privacy Policy</span></Link>
            </label>
          </div>
          
          <motion.button
            type="submit"
            className="auth-page__submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={!agreeTerms && loading}
          >
            Create Account
          </motion.button>
        </form>
        
        <div className="auth-page__divider">
          <span>Or sign up with</span>
        </div>
        
        <div className="auth-page__social-buttons">
          <button className="auth-page__social-btn">
            <FaGoogle />
            Google
          </button>
          <button className="auth-page__social-btn">
            <FaFacebook />
            Facebook
          </button>
        </div>
        
        <div className="auth-page__footer">
          <p>
            Already have an account?{' '}
            <Link to="/login">
              Sign In
            </Link>
          </p>
        </div>
        
        <div className="auth-page__terms">
          By creating an account, you agree to our <Link href="/terms">Terms of Service</Link> and acknowledge our <Link href="/privacy">Privacy Policy</Link>.
        </div>
      </motion.div>
    </div>
  )
}

export default signUp