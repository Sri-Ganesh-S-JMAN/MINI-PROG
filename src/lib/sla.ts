import { Ticket } from "@prisma/client";

export default function slaCheck(ticket: Ticket): any[] {
  const creationTime = ticket.createdAt;
  const now = new Date();
  
  const durationInHours = (now.getTime() - creationTime.getTime()) / (1000 * 60 * 60);
  
  const limit = ticket.slaHours;
  
  return [durationInHours,limit,durationInHours <= limit];
}

export function getSlaStatus(ticket: Ticket):string{
  const status = slaCheck(ticket)
  if (status[2]==true){
    const hoursRemaining = status[1] - status[0];
    if (hoursRemaining < 1 && hoursRemaining > 0) return 'warning';
    return 'compliant';
  }
  return 'breached'
}