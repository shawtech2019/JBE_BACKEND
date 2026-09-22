import {
    findActiveLeaseByTenant
  } from '../repositories/lease.repository.js'
  
  import {
    getPaidTotal
  } from '../repositories/payment.repository.js'
  
  import { ApiError } from '../utils/api-error.js'
  
  function calculateMonths(
    startDate,
    endDate
  ) {
    const start =
      new Date(startDate)
  
    const end =
      new Date(endDate)
  
    return (
      (end.getFullYear() -
        start.getFullYear()) *
        12 +
  
      (end.getMonth() -
        start.getMonth()) +
  
      1
    )
  }
  
  export async function getDashboard(
    tenantId
  ) {
    const lease =
      await findActiveLeaseByTenant(
        tenantId
      )
  
    if (!lease) {
      throw new ApiError(
        404,
        'No active lease found'
      )
    }
  
    const totalPaid =
      await getPaidTotal(
        tenantId,
        lease.id
      )
  
    const totalLeaseMonths =
      calculateMonths(
        lease.leaseStartDate,
        lease.leaseEndDate
      )
  
    const totalLeaseAmount =
      totalLeaseMonths *
      Number(lease.monthlyRent)
  
    const percentagePaid =
      totalLeaseAmount > 0
        ? Math.min(
            100,
            Math.round(
              (
                totalPaid /
                totalLeaseAmount
              ) * 100
            )
          )
        : 0
  
    return {
      lease: {
        id: lease.id,
  
        apartment:
          lease.apartment,
  
        unit:
          lease.unit,
  
        monthlyRent:
          Number(
            lease.monthlyRent
          ),
  
        leaseStartDate:
          lease.leaseStartDate,
  
        leaseEndDate:
          lease.leaseEndDate,
  
        status:
          lease.status,
  
        autoPayEnabled:
          Boolean(
            lease.autoPayEnabled
          )
      },
  
      financial: {
        totalLeaseMonths,
  
        totalLeaseAmount,
  
        totalPaid,
  
        remainingAmount:
          Math.max(
            0,
            totalLeaseAmount -
              totalPaid
          ),
  
        percentagePaid
      }
    }
  }