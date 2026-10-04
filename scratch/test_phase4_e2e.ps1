$url = 'https://wfanwyfyzqiqoylfmyyt.supabase.co'
$key = 'sb_publishable_edlwj9MbEUloEq0clQ_o2w_v8I-skdO'

$headers = @{
    'apikey'        = $key
    'Authorization' = "Bearer $key"
    'Content-Type'  = 'application/json'
    'Prefer'        = 'return=minimal'
}

Write-Host "=========================================================="
Write-Host "VERIFICACION EN SLOT DISPONIBLE (10:00:00 - 10:45:00)"
Write-Host "=========================================================="

$servicesUri = $url + '/rest/v1/services?select=*&active=eq.true'
$workersUri = $url + '/rest/v1/workers?select=*&active=eq.true'

$services = Invoke-RestMethod -Uri $servicesUri -Headers $headers
$workers = Invoke-RestMethod -Uri $workersUri -Headers $headers

$targetService = $services[0]
$targetWorker = $workers[0]

$testDate = "2026-10-15" # Jueves 15 de Octubre de 2026
$startTime = "10:00:00"
$endTime = "10:45:00"
$startsAt = "2026-10-15T10:00:00+02:00"
$endsAt = "2026-10-15T10:45:00+02:00"

$randomStr = -join ((65..90) + (48..57) | Get-Random -Count 4 | ForEach-Object { [char]$_ })
$bookingCode = "#ARX-2026-$randomStr"

$payload = @{
    business_id      = "a0000000-0000-0000-0000-000000000001"
    worker_id        = $targetWorker.id
    service_id       = $targetService.id
    appointment_code = $bookingCode
    customer_name    = "Cliente Prueba Fase4 OK"
    customer_phone   = "666123456"
    customer_email   = "prueba.fase4@ejemplo.com"
    appointment_date = $testDate
    start_time       = $startTime
    end_time         = $endTime
    total_price      = [decimal]$targetService.price
    status           = "confirmed"
    starts_at        = $startsAt
    ends_at          = $endsAt
} | ConvertTo-Json

Write-Host "`nInsertando Cita de Prueba Real en Supabase..."
Write-Host "  - Codigo Cita: $bookingCode"
Write-Host "  - Fecha: $testDate | Horario: $startTime - $endTime"
Write-Host "  - Profesional: $($targetWorker.name)"

$apptUri = $url + '/rest/v1/appointments'

try {
    $null = Invoke-RestMethod -Uri $apptUri -Method Post -Headers $headers -Body $payload
    Write-Host "  --> EXITO TOTAL: Status 201 Created. Cita $bookingCode persistida en Supabase."
} catch {
    Write-Host "  --> ERROR: $_"
}
