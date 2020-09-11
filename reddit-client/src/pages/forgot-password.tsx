import React, { useState } from "react";
import Wrapper from "../components/Wrapper";
import { Formik, Form } from "formik";
import login from "./login";
import { toErrorMap } from "../utils/toErrorMap";
import InputField from "../components/InputField";
import { Box, Flex, Button, Link } from "@chakra-ui/core";
import { useForgotPasswordMutation } from "../generated/graphql";
import { withUrqlClient } from "next-urql";
import { createUrqlClient } from "../utils/createUrqlClient";

const ForgotPassword: React.FC<{}> = ({}) => {
  const [complete, setComplete] = useState(false);
  const [, forgotPassword] = useForgotPasswordMutation();
  return (
    <Wrapper variant="small">
      <Formik
        initialValues={{ email: "" }}
        onSubmit={async (values) => {
          await forgotPassword(values);
          setComplete(true)
        }}
      >
        {({ isSubmitting }) =>
          complete ? (
            <Box>
              If an account with that email exists, we sent you an email
            </Box>
          ) : (
            <Form>
              <Box my={4}>
                <InputField
                  name="email"
                  placeholder="Enter Email"
                  label="Email"
                  type="email"
                />
              </Box>
              <Button
                type="submit"
                variantColor="teal"
                isLoading={isSubmitting}
              >
                Send Email
              </Button>
            </Form>
          )
        }
      </Formik>
    </Wrapper>
  );
};

export default withUrqlClient(createUrqlClient)(ForgotPassword);
