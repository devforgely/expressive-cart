import { Box, Button, Container, Divider, Link, Paper, Stack, TextField, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingButton } from '../../components/Button/LoadingButton';
import { useAppDispatch, useAppSelector } from '../../store/store';

import { loginUser, type CredentialsParams } from '../../store/auth/Auth.actions';

import * as Yup from 'yup';

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { error } = useAppSelector(state => state.auth);
  const [isLoading, setIsLoading] = useState(false);

  // Login handler
  const handleLogin = async (credentials: CredentialsParams) => {
    try {
      setIsLoading(true);
      await dispatch(loginUser(credentials));
      setIsLoading(false);
      navigate('/');
    } catch(err) {
      setIsLoading(false);
    }
  }

  const loginSchema = Yup.object().shape({
    email: Yup.string()
      .email("Invalid email address")
      .required("Email address is required"),

    password: Yup.string()
      .required("Password is required")
  })

  return (
    <section>
      <Container maxWidth="sm">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
          }}
        >
          <Paper elevation={3} sx={{ width: '100%', p: 4 }}>
            <Formik
              initialValues={{ email: '', password: '' }}
              validationSchema={loginSchema}
              validateOnBlur
              onSubmit={async (data) => {
                await handleLogin(data);
              }}
            >
              {({ errors, touched }) => (
                <Form>
                  {/* Header */}
                  <Box sx={{ mb: 4 }}>
                    <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
                      Log in
                    </Typography>
                  </Box>

                  {/* Form Fields */}
                  <Stack spacing={3}>
                    <TextField
                      label="Email"
                      name="email"
                      type="email"
                      variant="outlined"
                      
                      error={touched.email && !!errors.email}
                      helperText={touched.email && errors.email}
                    />

                    <TextField
                      fullWidth
                      label="Password"
                      name="password"
                      type="password"
                      variant="outlined"
                      error={touched.password && !!errors.password}
                      helperText={touched.password && errors.password}
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
                      Log in
                    </LoadingButton>

                    {/* Forgot Password */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Link href="/forgot-password" underline="hover" variant="body2">
                        Forgotten your password?
                      </Link>
                    </Box>
                  </Stack>

                  {/* Divider - Social Login */}
                  <Divider sx={{ my: 3 }}>
                    <Typography variant="body2" color="textSecondary">
                      Or continue with
                    </Typography>
                  </Divider>

                  {/* Social Login */}
                  <Stack spacing={2}>
                    <LoadingButton
                      fullWidth
                      variant="outlined"
                      color="inherit"
                      href="/api/auth/google"
                    >
                      Google
                    </LoadingButton>
                  </Stack>

                  {/* Divider - Register */}
                  <Divider sx={{ my: 4 }}>
                    <Typography variant="body2" color="textSecondary">
                      New to Expressive Cart?
                    </Typography>
                  </Divider>

                  {/* Register Section */}
                  <Box sx={{ textAlign: 'center' }}>
                    <Button
                      variant="outlined"
                      color="primary"
                      fullWidth
                      onClick={() => navigate('/register')}
                      sx={{
                        borderRadius: '50px',
                        textTransform: 'none',
                        fontSize: '1rem',
                        py: 1.2,
                      }}
                    >
                      Create Account
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

export default Login;
