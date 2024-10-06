"use client";
import { exchangeOAuthCode } from "@/app/utils/oauth";
import { Box, Text, Spinner, Alert, Link } from "@chakra-ui/react";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { setAuthParams, setUserProfile } from "@/app/lib/store/authSlice";

export default function GithubCallback() {
  const singleCallRef = useRef(false);
  const router = useRouter();
  const dispatch = useDispatch();
  const [errorDescription, setErrorDescription] = useState<
    string | undefined
  >();

  // Auth params
  const searchParams = useSearchParams();
  const authCode = searchParams?.get("code");
  const authState = searchParams?.get("state");

  useEffect(() => {
    /* Ensure that actions are called only once */
    if (singleCallRef.current) return;
    singleCallRef.current = true;

    const error = searchParams?.get("error");
    const errDescription = searchParams?.get("error_description");

    /* Check for response errors */
    if (!!error) {
      setErrorDescription(
        errDescription ??
          "There was an error authenticating user account. Please, refresh the web page.",
      );
      setTimeout(() => {
        router.replace("/");
      }, 8000);
      return;
    }

    /* Ensure the auth params are valids */
    if (!authCode || !authState) {
      setErrorDescription("Invalid authentication data");
      setTimeout(() => {
        router.replace("/");
      }, 8000);
      return;
    }

    /* Exchange authorization code by access token */
    const finishOAuth = async () => {
      try {
        const response = await exchangeOAuthCode(authCode!, authState!);
        dispatch(
          setAuthParams({
            token: response.accessToken,
            refresh: response.refreshToken,
          }),
        );
        dispatch(setUserProfile(response.profile));
        router.replace("/");
      } catch {
        setErrorDescription(
          errDescription ??
            "There was an error authenticating user account. Please, try it again.",
        );
        setTimeout(() => {
          router.replace("/auth");
        }, 8000);
      }
    };
    finishOAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authCode, authState]);

  return (
    <>
      {errorDescription ? (
        <Alert
          status="error"
          flexDirection="column"
          w="75%"
          m="auto"
          textAlign="center"
        >
          <Text fontWeight="bold">{errorDescription}</Text>
          <Text mt={4}>
            You will be redirected automatically to{" "}
            <Link href="/" fontWeight="bold">
              home screen
            </Link>
          </Text>
        </Alert>
      ) : (
        <Box m="auto" display="flex" alignItems="center">
          <Spinner /> <Text ml={4}>Validating credentials</Text>
        </Box>
      )}
    </>
  );
}
