import React, { useState } from 'react';
import { Check, Copy, Code2 } from 'lucide-react';

const KOTLIN_CODE = `package com.infinitynumbers.data.api

import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Field
import retrofit2.http.FormUrlEncoded

/**
 * Interface Retrofit para a API da Twilio
 * Substitua AccountSid pela sua credencial.
 */
interface TwilioApi {
    // Busca números móveis disponíveis de um país
    @GET("Accounts/{AccountSid}/AvailablePhoneNumbers/{CountryCode}/Mobile.json")
    suspend fun getAvailableNumbers(
        @Path("AccountSid") accountSid: String,
        @Path("CountryCode") countryCode: String
    ): AvailableNumbersResponse

    // Efetua a compra do número de telefone (Cobra do Saldo)
    @FormUrlEncoded
    @POST("Accounts/{AccountSid}/IncomingPhoneNumbers.json")
    suspend fun buyNumber(
        @Path("AccountSid") accountSid: String,
        @Field("PhoneNumber") phoneNumber: String
    ): IncomingNumberResponse

    // Recupera o Inbox de SMS do número (Para ler códigos de WhatsApp, Telegram, etc)
    @GET("Accounts/{AccountSid}/Messages.json")
    suspend fun getMessages(
        @Path("AccountSid") accountSid: String,
        @Query("To") phoneNumber: String,
        @Query("Limit") limit: Int = 20
    ): MessagesResponse
}

// ==========================================
// MODELS.KT
// ==========================================
data class AvailableNumbersResponse(
    val availablePhoneNumbers: List<AvailablePhoneNumber>
)

data class AvailablePhoneNumber(
    val phoneNumber: String,
    val locality: String?
)

data class IncomingNumberResponse(
    val sid: String,
    val phoneNumber: String,
    val dateCreated: String
)

data class MessagesResponse(
    val messages: List<MessageDto>
)

data class MessageDto(
    val sid: String,
    val body: String,
    val from: String,
    val dateCreated: String
)

data class VirtualNumber(
    val phoneNumber: String,
    val sid: String,
    val country: TelephonyRepository.Country
)

data class SmsMessage(
    val id: String,
    val body: String,
    val from: String
)

// ==========================================
// REPOSITORY.KT - Lógica Central (StateFlow e Coroutines)
// ==========================================
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.delay

class TelephonyRepository(
    private val api: TwilioApi,
    private val accountSid: String
) {
    // Lista de Países e seus respectivos DDI e ISO
    enum class Country(val isoCode: String, val ddi: String, val displayName: String) {
        BRAZIL("BR", "+55", "Brasil"),
        USA("US", "+1", "Estados Unidos"),
        UK("GB", "+44", "Reino Unido"),
        CANADA("CA", "+1", "Canadá"),
        PORTUGAL("PT", "+351", "Portugal"),
        SPAIN("ES", "+34", "Espanha"),
        SWITZERLAND("CH", "+41", "Suíça"),
        POLAND("PL", "+48", "Polônia")
    }

    private val _messages = MutableStateFlow<List<SmsMessage>>(emptyList())
    val messages: StateFlow<List<SmsMessage>> = _messages.asStateFlow()

    private val _isLoading = MutableStateFlow(false)
    val isLoading: StateFlow<Boolean> = _isLoading.asStateFlow()

    suspend fun buyVirtualNumber(country: Country): VirtualNumber? {
        _isLoading.value = true
        return try {
            // 1. Busca números disponíveis no país exato
            val available = api.getAvailableNumbers(accountSid, country.isoCode)
            val numberToBuy = available.availablePhoneNumbers.firstOrNull()?.phoneNumber
                ?: throw Exception("Sem números disponíveis para \${country.displayName}")

            // 2. Compra o número real (já formatado com DDI e DDD corretos da região)
            val purchased = api.buyNumber(accountSid, numberToBuy)
            
            VirtualNumber(
                phoneNumber = purchased.phoneNumber,
                sid = purchased.sid,
                country = country
            )
        } catch (e: Exception) {
            e.printStackTrace()
            null
        } finally {
            _isLoading.value = false
        }
    }

    suspend fun startListeningForSms(phoneNumber: String) {
        // Polling constante e assíncrono para garantir o recebimento na hora
        while (true) {
            try {
                val response = api.getMessages(accountSid, phoneNumber)
                _messages.value = response.messages.map { 
                    SmsMessage(id = it.sid, body = it.body, from = it.from)
                }
            } catch (e: Exception) {
                e.printStackTrace()
            }
            // Verifica a cada 3 segundos (ideal para SMS 2FA)
            delay(3000)
        }
    }
}
`;

export function AndroidKotlinCode() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(KOTLIN_CODE);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#121212]">
      <div className="p-4 flex items-center justify-between border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <Code2 className="w-5 h-5 text-zinc-400" />
          <h2 className="text-sm font-semibold tracking-wide text-zinc-200 uppercase">
            Android SDK (Kotlin)
          </h2>
        </div>
        <button
          onClick={handleCopy}
          className="bg-zinc-800 hover:bg-zinc-700 text-white p-2 rounded-lg transition-colors flex items-center gap-2 text-xs font-medium"
        >
          {copied ? (
            <><Check className="w-4 h-4 text-green-400" /> Copiado</>
          ) : (
            <><Copy className="w-4 h-4" /> Copiar Código</>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mb-4 text-xs text-zinc-400 leading-relaxed bg-zinc-900/50 p-4 rounded-xl border border-zinc-800">
          Este código Kotlin implementa a integração real via Retrofit utilizando Coroutines e StateFlow.
          A classe enum <strong>Country</strong> já contém os DDIs solicitados (+55, +1, +44, +351, +34, +41, +48).
          Insira sua chave API no inicializador do Retrofit e use o <strong>startListeningForSms</strong> para ler códigos do WhatsApp e Telegram em tempo real.
        </div>
        <div className="bg-[#1a1a1a] rounded-xl border border-zinc-800 p-4 overflow-x-auto">
          <pre className="text-[11px] font-mono leading-relaxed text-emerald-400/90 whitespace-pre-wrap word-break-all">
            {KOTLIN_CODE}
          </pre>
        </div>
      </div>
    </div>
  );
}
