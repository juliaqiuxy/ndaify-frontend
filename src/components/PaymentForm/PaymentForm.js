import React, { useCallback } from 'react';
import styled from 'styled-components';

import {
  Formik,
  Field as FormikField,
  Form,
} from 'formik';

import Router from 'next/router';

import { API } from '../../api';

import Button from '../Clickable/Button';
import Input from '../Input/Input';
import Footer from '../Footer/Footer';
import CreatorInfo from '../CreatorInfo/CreatorInfo';
import ErrorMessage from '../ErrorMessage/ErrorMessage';
import UserActionBanner from '../UserActionBanner/UserActionBanner';

const Container = styled.div`
  width: 100%;
  height: 100%;
  justify-content: center;
  align-items: center;
  display: flex;
  flex-direction: column;
`;

const ContentContainer = styled.div`
  padding: 1pc;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 768px;
  width: 100%;
  margin-top: 3pc;
  padding-top: 2pc;
  flex-direction: column;
  flex: 1;
  box-sizing: border-box;
`;

const DialogContainer = styled.div`
  margin-bottom: 5pc;
`;

const DialogTitle = styled.h3`
  font-size: 28px;
  margin: 0;
  margin-bottom: 2pc;
  font-weight: 400;
  text-align: center;
  color: #ffffff;

  @media screen and (min-width: 992px) {
    font-size: 32px;
  }
`;

const DialogLongText = styled.p`
  font-size: 16px;
  margin: 0;
  margin-bottom: 2pc;
  color: #ffffff;
  font-weight: 200;

  @media screen and (min-width: 992px) {
    font-size: 20px;
  }

  :last-of-type {
    margin-bottom: 0;
  }
`;

const UnderlineText = styled.span`
  text-decoration: underline;
`;

const PaymentFormContainer = styled.div`
  max-width: 576px;
  width: 100%;
  margin: 2pc;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
`;

const PaymentFormRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  flex-direction: column;
  height: 140px;

  @media screen and (min-width: 992px) {
    flex-direction: row;
    height: auto;
    margin: 0;
    margin-bottom: 2pc;

    :nth-of-type(3) {
      margin-bottom: 0;
    }
  }
`;

const TwoColInputContainer = styled.div`
  flex: 1;

  :nth-child(2) {
    margin-left: 0;
  }

  @media screen and (min-width: 992px) {
    :nth-child(2) {
      margin-left: 1pc;
    }
  }
`;

const DividerContainer = styled.div`
  display: flex;
  justify-content: space-between;
  display: flex;
  align-items: center;
  margin-top: 1pc;
`;

const DividerLine = styled.div`
  height: 3px;
  width: 200px;
  background-color: #aaaaaa;
  margin-left: 1pc;
  margin-right: 1pc;
`;

const DividerText = styled.span`
  color: #aaaaaa;
  text-transform: uppercase;
  font-size: 16px;
  font-weight: 700;

  @media screen and (min-width: 992px) {
    font-size: 20px;
  }
`;

const Total = styled.h4`
  font-size: 20px;
  margin-top: 2pc;
  font-weight: 200;
  color: #aaaaaa;

  @media screen and (min-width: 992px) {
    font-size: 24px;
  }
`;

const Dialog = styled.div`
  height: 100%;
  position: relative;
  background-color: #383B49;
  border-radius: 4px;
  line-height: 28px;
  padding: 2pc;
  margin-bottom: 2pc;

  :after {
    content: "";
    position: absolute;
    bottom: 0;
    left: 6%;
    width: 0;
    height: 0;
    border: 12px solid transparent;
    border-top-color: #383b49;
    border-bottom: 0;
    border-right: 0;
    margin-left: -6px;
    margin-bottom: -12px;
  }
`;

const Divider = () => (
  <DividerContainer>
    <DividerLine />
    <DividerText>Or</DividerText>
    <DividerLine />
  </DividerContainer>
);

const PaymentForm = ({ user, nda: ndaPayload }) => {
  const handleSubmit = async (
    values,
    {
      setStatus,
    },
  ) => {
    // clear all error messages before retrying
    setStatus();

    const api = new API();

    try {
      const { nda } = await api.createNda(ndaPayload);

      Router.replace('/nda/sent-[ndaId]', `/nda/sent-${nda.ndaId}`);
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(error);
      setStatus({ errorMessage: error.message });
    }
  };
  const onSubmit = useCallback(handleSubmit, []);

  const handleCancelClick = () => {
    Router.replace('/');
    sessionStorage.clear();
  };
  const onCancelClick = useCallback(handleCancelClick, []);

  const initialValues = {
    nameOnCard: '',
    cardNumber: '',
    expiration: '',
    cvc: '',
    noPaymentReason: '',
  };

  return (
    <Container>
      <UserActionBanner
        user={user}
        actionButton={() => (
          <Button
            outline
            onClick={onCancelClick}
          >
            Cancel
          </Button>
        )}
      />

      <ContentContainer>
        <DialogContainer>
          <DialogTitle>One last thing before delivery…</DialogTitle>

          <Dialog>
            <DialogLongText>Hi Joe,</DialogLongText>
            <DialogLongText>
              It costs money to keep NDAify running. If you use the service and
              find it valuable, plese help me stay online by making a small
              donation.
            </DialogLongText>
            <DialogLongText>
              Or, share a good reason below for why you can’t pay and you can
              still use NDAify for
              {' '}
              <UnderlineText>free</UnderlineText>
              .
            </DialogLongText>

            <DialogLongText>
              Any questions or comments? Just send me a tweet, I’m always
              listening.
            </DialogLongText>
            <DialogLongText>Thank you for using NDAify!</DialogLongText>
          </Dialog>
          <CreatorInfo />
        </DialogContainer>

        <PaymentFormContainer>
          <Formik
            initialValues={initialValues}
            validateOnChange={false}
            validateOnBlur
            onSubmit={onSubmit}
          >
            {({ status, isSubmitting }) => (
              <Form>
                {
                  status ? (
                    <ErrorMessage style={{ marginBottom: '3pc' }}>
                      {status.errorMessage}
                    </ErrorMessage>
                  ) : null
                }
                <PaymentFormRow>
                  <TwoColInputContainer>
                    <FormikField
                      as={Input}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      name="nameOnCard"
                      placeholder="Name on card"
                      spellCheck={false}
                    />
                  </TwoColInputContainer>
                  <TwoColInputContainer>
                    <FormikField
                      as={Input}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      name="cardNumber"
                      placeholder="Card Number"
                      spellCheck={false}
                    />
                  </TwoColInputContainer>
                </PaymentFormRow>
                <PaymentFormRow>
                  <TwoColInputContainer>
                    <FormikField
                      as={Input}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      name="expiration"
                      placeholder="MM / YY"
                      spellCheck={false}
                    />
                  </TwoColInputContainer>
                  <TwoColInputContainer>
                    <FormikField
                      as={Input}
                      autoCapitalize="none"
                      autoComplete="off"
                      autoCorrect="off"
                      name="cvc"
                      placeholder="CVC"
                      spellCheck={false}
                    />
                  </TwoColInputContainer>
                </PaymentFormRow>

                <Divider />

                <div style={{ marginTop: '1pc' }}>
                  <FormikField
                    as={Input}
                    autoCapitalize="none"
                    autoComplete="off"
                    autoCorrect="off"
                    name="noPaymentReason"
                    placeholder="I can’t pay because…"
                    spellCheck={false}
                  />
                </div>

                <Total>Total $ 1.00</Total>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: '#39d494' }}
                  spin={isSubmitting}
                >
                  Send
                </Button>
              </Form>
            )}
          </Formik>
        </PaymentFormContainer>
        <Footer withLogo />
      </ContentContainer>
    </Container>
  );
};

export default PaymentForm;