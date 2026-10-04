$url = 'https://wfanwyfyzqiqoylfmyyt.supabase.co'
$key = 'sb_publishable_edlwj9MbEUloEq0clQ_o2w_v8I-skdO'

$headers = @{
    'apikey'        = $key
    'Authorization' = "Bearer $key"
    'Content-Type'  = 'application/json'
    'Prefer'        = 'return=minimal'
}

Write-Host "--- 1. CONSULTANDO SERVICIOS Y TRABAJADORES EN SUPABASE ---"
$services = Invoke-RestMethod -Uri "$url/rest/v1/services?select=*&active=eq.true" -Headers $headers
$workers = Invoke-RestMethod -Uri "$url/rest/v1/workers?select=*&active=eq.true" -Headers $headers

Write-Host "Servicios encontrados ($($services.Count)):"
foreach ($s in $services) {
    Write-Host "  - ID: $($s.id) | Nombre: $($s.name) | Precio: $($s.price) € | Duración: $($s.duration_minutes) min"
}

Write-Host "Trabajadores encontrados ($($workers.Count)):"
foreach ($w in $workers) {
    Write-Host "  - ID: $($w.id) | Nombre: $($w.name) | Rol: $($w.role_title)"
}

# Elegir servicio y trabajador para la cita de prueba
$targetService = $services[0] # Corte de pelo
$targetWorker = $workers[0]  # Darío

$testDate = "2026-10-14" # Miércoles 14 de Octubre de 2026
$startTime = "09:00:00"
$endTime = "09:45:00"
$startsAt = "${testDate}T09:00:00+02:00"
$endsAt = "${testDate}T09:45:00+02:00"

# Generar un código único
$randomStr = -join ((65..90) + (48..57) | Get-Random -Count 4 | ForEach-Object { [char]$_ })
$bookingCode = "#ARX-2026-$randomStr"

$payload = @{
    business_id      = "a0000000-0000-0000-0000-000000000001"
    worker_id        = $targetWorker.id
    service_id       = $targetService.id
    appointment_code = $bookingCode
    customer_name    = "Cliente Prueba Fase4"
    customer_phone   = "666 999 888"
    customer_email   = "prueba.fase4@ejemplo.com"
    appointment_date = $testDate
    start_time       = $startTime
    end_time         = $endTime
    total_price      = [decimal]$targetService.price
    status           = "confirmed"
    starts_at        = $startsAt
    ends_at          = $endsAt
} | ConvertTo-Json

Write-Host "`n--- 2. CREANDO CITA DE PRUEBA EN SUPABASE (FASE 4) ---"
Write-Host "Código de cita generado: $bookingCode"
Write-Host "Fecha: $testDate | Hora: $startTime - $endTime | Profesional: $($targetWorker.name)"

try {
    $createResult = Invoke-RestMethod -Uri "$url/rest/v1/appointments" -Method Post -Headers $headers -Body $payload
    Write-Host "¡Cita creada exitosamente en Supabase (status 201 Created)!"
} catch {
    Write-Host "Error al crear cita:" $_.Exception.Message
}
