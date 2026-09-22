import {
    getPaymentDashboard,
    getHistory,
    initiatePayment,
    getPayment,
    setAutoPay
  } from '../services/payment.service.js'
  
  import { ApiError } from '../utils/api-error.js'
  
  export async function paymentDashboardController(
    req,
    res
  ) {
    if (!req.user) {
      throw new ApiError(
        401,
        'Authentication required'
      )
    }
  
    const data =
      await getPaymentDashboard(
        req.user.id
      )
  
    res.json({
      success: true,
      data
    })
  }
  
  export async function paymentHistoryController(
    req,
    res
  ) {
    if (!req.user) {
      throw new ApiError(
        401,
        'Authentication required'
      )
    }
  
    const data =
      await getHistory(
        req.user.id
      )
  
    res.json({
      success: true,
      data
    })
  }
  
  export async function createPaymentController(
    req,
    res
  ) {
    if (!req.user) {
      throw new ApiError(
        401,
        'Authentication required'
      )
    }
  
    const data =
      await initiatePayment(
        req.user.id,
        req.body
      )
  
    res.status(201).json({
      success: true,
      data
    })
  }
  
  export async function getPaymentController(
    req,
    res
  ) {
    if (!req.user) {
      throw new ApiError(
        401,
        'Authentication required'
      )
    }
  
    const payment =
      await getPayment(
        req.user.id,
        Number(
          req.params.id
        )
      )
  
    res.json({
      success: true,
      data: payment
    })
  }
  
  export async function autoPayController(
    req,
    res
  ) {
    if (!req.user) {
      throw new ApiError(
        401,
        'Authentication required'
      )
    }
  
    const result =
      await setAutoPay(
        req.user.id,
        req.body.enabled
      )
  
    res.json({
      success: true,
      data: result
    })
  }