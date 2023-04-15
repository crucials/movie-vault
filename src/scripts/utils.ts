export function getDaysPassedCount(fromDate : Date) {
    const currentDate = new Date()
    const millisecondsDifference = currentDate.getTime() - fromDate.getTime()

    const dayInMilliseconds = 1000 * 60 * 60 * 24

    return Math.round(millisecondsDifference / dayInMilliseconds)
}

export function getHoursAndMinutes(totalMinutes : number) {
    const hours = Math.floor(totalMinutes / 60)
    const minutes = totalMinutes % 60

    return { hours, minutes }
}