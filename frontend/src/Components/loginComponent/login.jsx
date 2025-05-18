import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { FaGoogle, FaFacebook } from 'react-icons/fa'
import { Link,useNavigate } from 'react-router-dom'
import './login.css'
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as Yup from "yup";
import { TextInputComponent } from '../../Common/form/form'
import { AuthApi, useLoginMutation } from '../../api/auth.api'
import { useDispatch } from 'react-redux'
import { setLoggedInUser } from '../../reducer/userReducer'
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const login = () => {
    const dispatch = useDispatch()
    const [loading, setLoading] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const navigate = useNavigate()
    const [loginUser] = useLoginMutation();

    const loginDTO = Yup.object({
        email: Yup.string().email().required(),
        password: Yup.string().required()
      });
    
    const {  handleSubmit, control,formState: { errors }, } = useForm({
    resolver: yupResolver(loginDTO),
    });

  

    const login = async(data)=>{
        setLoading(true)
        try{
          const response = await loginUser(data).unwrap();
          toast.success("Login successful")
          localStorage.setItem("_at", response.result.token.token)
          localStorage.setItem("_rt", response.result.token.refreshToken)
          dispatch(setLoggedInUser(response.result.userDetails))
          dispatch(AuthApi.util.invalidateTags(['Auth']));
          setTimeout(() => {
            navigate('/');
          }, 500); 

        }catch(exception){
          toast.error(exception.data?.message || "Login failed");
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
        <h1 className="auth-page__title">Welcome Back</h1>
        
        <form onSubmit={handleSubmit(login)} className="auth-page__form">
          <div className="auth-page__form-group">
            <label htmlFor="email" className="auth-page__label">
              Email Address
            </label>
            <TextInputComponent
                control={control}
                name="email"
                errMsg={errors?.email?.message || null}
                required={true}
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
                required={true}
                control={control}
            />
          </div>
          
          <div className="auth-page__form-actions">
            <div className="auth-page__checkbox-container">
              <input
                id="remember-me"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="auth-page__checkbox"
              />
              <label htmlFor="remember-me" className="auth-page__checkbox-label">
                Remember me
              </label>
            </div>
            
            <Link to="/forgot-password" className="auth-page__forgot-link">
              Forgot password?
            </Link>
          </div>
          
          <motion.button
            type="submit"
            className="auth-page__submit-btn"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            disabled={loading}
          >
            Sign In
          </motion.button>
        </form>
        
        <div className="auth-page__divider">
          <span>Or continue with</span>
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
            Don't have an account?{' '}
            <Link to="/signup">
              Create Account
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default login