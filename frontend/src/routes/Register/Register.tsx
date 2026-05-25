import { Box, Button, Container, Divider, Paper, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '../../components/Button/LoadingButton';
import { useAppDispatch, useAppSelector } from '../../store/store';

import { registerUser, type CredentialsParams } from '../../store/auth/Auth.actions';

import * as Yup from 'yup';

const Register = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  // Registration handler
  const handleRegister = async (credentials: CredentialsParams) => {
    try {
      setIsLoading(true);
      await dispatch(registerUser(credentials));
      setIsLoading(false);
      navigate('/');
    } catch(err) {
      setIsLoading(false);
    }
  }

  // Validation schema for registration form
  const registrationSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email address is required"),

    password: Yup.string()
      .required("Password is required")
      .min(8, 'Password must be at least 8 characters'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), undefined], 'Passwords must match')
      .required('Confirm password is required'),
  })

  return (
    <section>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '110vh',
          }}
        >
          <Paper elevation={3} sx={{ width: '100%', p: 4 }}>
            <Formik
              initialValues={{ email: '', password: '', confirmPassword: '' }}
              validationSchema={registrationSchema}
              validateOnBlur
              onSubmit={async (data: CredentialsParams) => {
                await handleRegister(data);
              }}
            >
              {({ errors, touched, values, handleChange, handleBlur }) => (
                <Form>
                  {/* Header */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                      Create Account
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                      Join Expressive Cart today
                    </Typography>
                  </Box>

                  {/* Form Fields */}
                  <Stack spacing={3}>
                    <TextField
                      fullWidth
                      label="Email"
                      name="email"
                      type="email"
                      variant="outlined"
                      value={values.email}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      variant="outlined"
                      value={values.password}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
                    />

                    <TextField
                      fullWidth
                      label="Confirm Password"
                      name="confirmPassword"
                      type="password"
                      variant="outlined"
                      value={values.confirmPassword}
                      onChange={handleChange}
                      onBlur={handleBlur}
                      error={touched.confirmPassword && !!errors.confirmPassword}
                      helperText={touched.confirmPassword && errors.confirmPassword}
                    />

                    {/* Error Message */}
                    {error && (
                      <Box
                        sx={{
                          bgcolor: '#ffebee',
                          color: '#c62828',
                          p: 2,
                          borderRadius: 1,
                          border: '1px solid #ef5350',
                        }}
                      >
                        <Typography variant="body2">{error}</Typography>
                      </Box>
                    )}

                    {/* Submit Button */}
                    <LoadingButton
                      fullWidth
                      variant="contained"
                      color="primary"
                      type="submit"
                      isLoading={isLoading}
                      size="large"
                    >
                      Create Account
                    </LoadingButton>
                  </Stack>

                  {/* Divider - Social Registration */}
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      Or continue with
                    </Typography>
                  </Divider>

                  {/* Social Registration */}
                  <Stack spacing={2} sx={{ mb: 4 }}>
                    <LoadingButton
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      href="/api/auth/google"
                    >
                      Google
                    </LoadingButton>
                  </Stack>

                  {/* Divider - Login */}
                  <Divider sx={{ my: 3 }} />

                  {/* Login Section */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ mb: 2, color: 'textSecondary' }}>
                      Already have an account?
                    </Typography>
                    <Button
                      onClick={() => navigate('/login')}
                      variant="outlined"
                      color="primary"
                      fullWidth
                      sx={{
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        py: 1.2,
                      }}
                    >
                      Log in
                    </Button>
                  </Box>
                </Form>
              )}
            </Formik>
          </Paper>
        </Box>
      </Container>
    </section>
  );
};

export default Register;
